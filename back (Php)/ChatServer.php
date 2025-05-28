<?php
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

require_once __DIR__ . '/models/Message.php';
require_once __DIR__ . '/services/JWTService.php';

class ChatServer implements MessageComponentInterface
{
    /** @var \SplObjectStorage<ConnectionInterface> */
    protected $clients;

    /** @var array<int, ConnectionInterface[]> mapping user_id ➜ array of sockets */
    protected $userSockets = [];

    protected $jwtService;
    protected $messageModel;

    public function __construct()
    {
        $this->clients      = new \SplObjectStorage;
        $this->jwtService   = new JWTService();
        $this->messageModel = new Message();
    }



    public function onOpen(ConnectionInterface $conn)
    {
        $this->clients->attach($conn);
        $conn->user_id = null;
    }

    public function onMessage(ConnectionInterface $from, $raw)
    {
        $data = json_decode($raw, true);
        if (!is_array($data) || !isset($data['action'])) {
            return $from->send(json_encode(['error' => 'Invalid JSON']));
        }


        if ($data['action'] === 'auth') {
            return $this->handleAuth($from, $data);
        }
        if (!isset($from->user_id) || $from->user_id === null) {
            return $from->send(json_encode(['error' => 'Unauthenticated – send an auth frame first']));
        }


        switch ($data['action']) {
            case 'send':
                $this->handleSend($from, $data);
                break;
            case 'edit':
                $this->handleEdit($from, $data);
                break;
            case 'delete':
                $this->handleDelete($from, $data);
                break;
            case 'typing':
                $this->handleTyping($from, $data);
                break;

            default:
                $from->send(json_encode(['error' => 'Unknown action']));
        }
    }

    public function onClose(ConnectionInterface $conn)
    {
        if (isset($conn->user_id) && $conn->user_id !== null) {

            $uid = $conn->user_id;
            $this->userSockets[$uid] = array_filter(
                $this->userSockets[$uid] ?? [],
                fn ($c) => $c !== $conn
            );
            if (!$this->userSockets[$uid]) {
                unset($this->userSockets[$uid]);
            }
        }
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        $conn->send(json_encode(['error' => 'Server error: ' . $e->getMessage()]));
        $conn->close();
    }

    /* ---------- Handlers ---------- */

    private function handleAuth(ConnectionInterface $conn, array $data): void
    {
        if (empty($data['token'])) {
            $conn->send(json_encode(['error' => 'Missing token']));
            return;
        }

        $user = $this->jwtService->decodeJWT($data['token']);
        if (!$user) {
            $conn->send(json_encode(['error' => 'Invalid token']));
            return;
        }

        $conn->user_id = $user->user_id;
        $this->userSockets[$user->user_id][] = $conn;

        $conn->send(json_encode(['type' => 'auth_ok', 'user_id' => $user->user_id]));
    }

    private function handleSend(ConnectionInterface $from, array $data): void
    {
        if (!isset($data['receiver_id'], $data['content'])) {
            $from->send(json_encode(['error' => 'receiver_id & content required']));
            return;
        }

        $sender   = $from->user_id;
        $receiver = (int) $data['receiver_id'];
        $content  = trim($data['content']);

        try {
            $msgId = $this->messageModel->send($sender, $receiver, $content);
            $messageRow = $this->messageModel->getMessageWithSenderInfo($msgId);

            $this->broadcast([$sender, $receiver], [
                'type'    => 'message_sent',
                'message' => $messageRow,
            ]);
        } catch (\Throwable $e) {
            $from->send(json_encode(['error' => 'Failed to send message']));
        }
    }

    private function handleEdit(ConnectionInterface $from, array $data): void
    {
        if (!isset($data['message_id'], $data['content'])) {
            $from->send(json_encode(['error' => 'message_id & content required']));
            return;
        }

        $mid     = (int) $data['message_id'];
        $content = trim($data['content']);
        $uid     = $from->user_id;

        try {
            $ok = $this->messageModel->edit($mid, $uid, $content);
            if (!$ok) {
                $from->send(json_encode(['error' => 'Not allowed to edit']));
                return;
            }
            $this->relayToConversation($mid, [
                'type'       => 'message_edited',
                'message_id' => $mid,
                'content'    => $content,
            ]);
        } catch (\Throwable $e) {
            $from->send(json_encode(['error' => 'Edit failed']));
        }
    }

    private function handleDelete(ConnectionInterface $from, array $data): void
    {
        if (!isset($data['message_id'])) {
            $from->send(json_encode(['error' => 'message_id required']));
            return;
        }

        $mid = (int) $data['message_id'];
        $uid = $from->user_id;


        $row = $this->messageModel->getMessageById($mid);
        if (!$row) {
            $from->send(json_encode(['error' => 'Message not found']));
            return;
        }

        try {
            $ok = $this->messageModel->delete($mid, $uid);
            if (!$ok) {
                $from->send(json_encode(['error' => 'Not allowed to delete']));
                return;
            }


            $this->broadcast([$row['sender_id'], $row['receiver_id']], [
                'type'       => 'message_deleted',
                'message_id' => $mid,
            ]);
        } catch (\Throwable $e) {
            $from->send(json_encode(['error' => 'Delete failed']));
        }
    }


    private function handleTyping(ConnectionInterface $from, array $data): void
    {
        if (!isset($data['receiver_id'])) return;

        $receiverId = (int) $data['receiver_id'];
        $senderId = $from->user_id;

        $this->broadcast([$receiverId], [
            'type'       => 'typing',
            'sender_id'  => $senderId
        ]);
    }




    private function broadcast(array $userIds, array $payload): void
    {
        $json = json_encode($payload);
        foreach ($userIds as $uid) {
            foreach ($this->userSockets[$uid] ?? [] as $sock) {
                $sock->send($json);
            }
        }
    }


    private function relayToConversation(int $messageId, array $payload): void
    {

        $db  = $this->messageModel;
        $row = $db->getMessageById($messageId);
        if (!$row) {
            return;
        }
        $this->broadcast([$row['sender_id'], $row['receiver_id']], $payload);
    }
}
