<?php
require_once __DIR__ . '/../services/connectionService.php';

class Post {
    private $conn;

    public function __construct() {
        $this->conn = ConnectionService::connect();
    }

    public function create($user_id, $content, $image) {
        $sql = "INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$user_id, $content, $image]);
        return $this->conn->lastInsertId();
    }

    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM posts WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAll() {
        $sql = "
        SELECT 
            posts.*, 
            users.username, 
            users.profile_picture
        FROM posts
        JOIN users ON posts.user_id = users.id
        ORDER BY posts.created_at DESC
    ";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }



    public function delete($postId, $userId) {
        $sql = "DELETE FROM posts WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$postId, $userId]);
    }

}