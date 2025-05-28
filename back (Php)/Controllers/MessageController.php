<?php
require_once __DIR__ . '/../models/Message.php';
require_once __DIR__ . '/../services/JWTService.php';

class MessageController {
    private $messageModel;
    private $jwtService;

    public function __construct() {
        $this->messageModel = new Message();
        $this->jwtService = new JWTService();
    }

    public function sendMessage() {
        $user = $this->jwtService->authorizeRequest();
        $sender_id = $user->user_id;

        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['receiver_id'], $input['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        $receiver_id = $input['receiver_id'];
        $content = $input['content'];

        try {
            $messageId = $this->messageModel->send($sender_id, $receiver_id, $content);
            echo json_encode(['success' => true, 'message_id' => $messageId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to send message', 'details' => $e->getMessage()]);
        }
    }

    public function getConversation() {
        $user2 = $_GET['user_id'] ?? null;
        if (!$user2) {
            http_response_code(400);
            echo json_encode(['error' => 'user_id parameter is required']);
            return;
        }

        $user = $this->jwtService->authorizeRequest();
        $user1 = $user->user_id;

        try {
            $conversation = $this->messageModel->getConversation($user1, $user2);
            echo json_encode(['conversation' => $conversation]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to retrieve conversation', 'details' => $e->getMessage()]);
        }
    }


    public function editMessage($messageId) {
        $user = $this->jwtService->authorizeRequest();
        $userId = $user->user_id;

        $input = json_decode(file_get_contents('php://input'), true);
        if (!isset($input['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing new content']);
            return;
        }

        try {
            $updated = $this->messageModel->edit($messageId, $userId, $input['content']);
            if ($updated) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(403);
                echo json_encode(['error' => 'Not authorized to edit this message']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to edit message', 'details' => $e->getMessage()]);
        }
    }

    public function deleteMessage($messageId) {
        $user = $this->jwtService->authorizeRequest();
        $userId = $user->user_id;

        try {
            $deleted = $this->messageModel->delete($messageId, $userId);
            if ($deleted) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(403);
                echo json_encode(['error' => 'Not authorized to delete this message']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete message', 'details' => $e->getMessage()]);
        }
    }

}
