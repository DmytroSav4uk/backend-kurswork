<?php
require_once __DIR__ . '/../services/connectionService.php';

class Follower {
    private $conn;

    public function __construct() {
        $this->conn = ConnectionService::connect();
    }

    public function follow($follower_id, $followed_id) {
        $sql = "INSERT INTO followers (follower_id, followed_id) VALUES (?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$follower_id, $followed_id]);
        return $this->conn->lastInsertId();
    }

    public function unfollow($follower_id, $followed_id) {
        $sql = "DELETE FROM followers WHERE follower_id = ? AND followed_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$follower_id, $followed_id]);
    }

    public function getFollowers($user_id) {
        $stmt = $this->conn->prepare("SELECT * FROM followers WHERE followed_id = ?");
        $stmt->execute([$user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getFollowing($user_id) {
        $stmt = $this->conn->prepare("SELECT * FROM followers WHERE follower_id = ?");
        $stmt->execute([$user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
