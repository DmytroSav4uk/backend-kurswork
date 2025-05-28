<?php
require_once __DIR__ . '/../services/connectionService.php';

class Message {
    private $conn;

    public function __construct() {
        $this->conn = ConnectionService::connect();
    }

    public function send($sender_id, $receiver_id, $content) {
        $sql = "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$sender_id, $receiver_id, $content]);
        return $this->conn->lastInsertId();
    }

    public function getConversation($user1, $user2) {
        $sql = "SELECT m.*, u.profile_picture 
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$user1, $user2, $user2, $user1]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }



    public function edit($messageId, $userId, $newContent) {
        $sql = "UPDATE messages SET content = ? WHERE id = ? AND sender_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$newContent, $messageId, $userId]);
        return $stmt->rowCount() > 0;
    }

    public function delete($messageId, $userId) {
        $sql = "DELETE FROM messages WHERE id = ? AND sender_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$messageId, $userId]);
        return $stmt->rowCount() > 0;
    }


    public function getMessageById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM messages WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getMessageWithSenderInfo($id) {
        $sql = "SELECT m.*, u.profile_picture
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


}
