<?php
require_once __DIR__ . '/../Services/connectionService.php';
require_once __DIR__ . '/../Services/JWTService.php';

class User {
    private $conn;

    public function __construct() {
        $this->conn = ConnectionService::connect();
    }


    public function create($username, $email, $password_hash, $full_name, $bio, $profile_picture) {

        if ($full_name === null) {
            $full_name = "Phantom Thief";
        }
        if ($bio === null) {
            $bio = "not specified";
        }


        $sql = "SELECT id FROM users WHERE username = ? OR email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$username, $email]);

        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'already exists'];
        }


        $sql = "INSERT INTO users (username, email, password_hash, full_name, bio, profile_picture) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$username, $email, $password_hash, $full_name, $bio, $profile_picture]);

        return ['success' => true, 'id' => $this->conn->lastInsertId()];
    }



    public function update($userId, $username, $full_name, $bio) {
        $sql = "UPDATE users SET username = ?, full_name = ?, bio = ? WHERE id = ?";
        $stmt = $this->conn->prepare($sql);

        try {
            $stmt->execute([$username, $full_name, $bio, $userId]);
            return ['success' => true, 'message' => 'User updated successfully'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }

    public function updateProfilePicture($userId, $profilePicturePath) {
        $sql = "UPDATE users SET profile_picture = ? WHERE id = ?";
        $stmt = $this->conn->prepare($sql);

        try {
            $stmt->execute([$profilePicturePath, $userId]);
            return ['success' => true, 'message' => 'Profile picture updated successfully'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }



    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public function getByEmail($email) {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

