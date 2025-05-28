<?php
require_once __DIR__ . '/../services/connectionService.php';

class Comment {
    private $conn;

    public function __construct() {
        $this->conn = ConnectionService::connect();
    }

    public function create($post_id, $user_id, $content) {
        $sql = "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$post_id, $user_id, $content]);
        return $this->conn->lastInsertId();
    }

    public function delete($comment_id, $user_id) {
        $sql = "DELETE FROM comments WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$comment_id, $user_id]);
    }

    public function update($comment_id, $user_id, $new_content) {
        $sql = "UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$new_content, $comment_id, $user_id]);
    }

    public function getByPostId($post_id) {
        $stmt = $this->conn->prepare("
        SELECT 
            c.id AS comment_id,
            c.post_id,
            c.user_id,
            c.content,
            c.created_at,
            c.updated_at,
            u.username,
            u.full_name,
            u.profile_picture
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    ");
        $stmt->execute([$post_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $comments = [];
        foreach ($rows as $row) {
            $comments[] = [
                'id' => $row['comment_id'],
                'post_id' => $row['post_id'],
                'user_id' => $row['user_id'],
                'content' => $row['content'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
                'user' => [
                    'id' => $row['user_id'],
                    'username' => $row['username'],
                    'full_name' => $row['full_name'],
                    'profile_picture' => $row['profile_picture']
                ]
            ];
        }

        return $comments;
    }

}
