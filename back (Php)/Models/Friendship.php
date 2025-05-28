<?php
require_once __DIR__ . '/../services/connectionService.php';

class Friendship {
    private $conn;

    public function __construct() {
        $this->conn = ConnectionService::connect();
    }

    public function sendRequest(int $userId, int $friendId) {
        $sql = "SELECT id, user_id, friend_id, status
                FROM friendships
                WHERE (user_id = ? AND friend_id = ?)
                   OR (user_id = ? AND friend_id = ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId, $friendId, $friendId, $userId]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);


        if ($existing && $existing['status'] === 'pending'
            && (int)$existing['user_id'] === $friendId) {
            return $this->acceptRequest($friendId, $userId);
        }


        if ($existing) {
            return false;
        }


        $sql = "INSERT INTO friendships (user_id, friend_id, status)
                VALUES (?, ?, 'pending')";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId, $friendId]);
        return (int)$this->conn->lastInsertId();
    }

    public function acceptRequest($user_id, $friend_id) {
        $sql = "UPDATE friendships SET status = 'accepted' WHERE user_id = ? AND friend_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$user_id, $friend_id]);
    }

    public function rejectRequest($user_id, $friend_id) {
        $sql = "DELETE FROM friendships WHERE user_id = ? AND friend_id = ? AND status = 'pending'";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$user_id, $friend_id]);
    }

    public function getFriends($user_id) {
        $sql = "SELECT 
                f.id AS friendship_id,
                f.status,
                f.created_at,
                u.*
            FROM friendships f
            JOIN users u 
                ON (u.id = f.friend_id AND f.user_id = ?) 
                OR (u.id = f.user_id AND f.friend_id = ?)
            WHERE f.user_id = ? OR f.friend_id = ?";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$user_id, $user_id, $user_id, $user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


}
