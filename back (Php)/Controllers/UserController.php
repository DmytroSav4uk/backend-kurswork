<?php
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Services/JWTService.php';

class UserController {

    public function updateProfile() {
        $headers = getallheaders();
        $jwt = null;

        if (isset($headers['Authorization'])) {
            $jwt = str_replace('Bearer ', '', $headers['Authorization']);
        }

        if (!$jwt) {
            http_response_code(401);
            echo json_encode(['error' => 'Token not provided']);
            return;
        }

        $jwtService = new JWTService();
        $decoded = $jwtService->decodeJWT($jwt);

        if (!$decoded || !isset($decoded->user_id)) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $userId = $decoded->user_id;

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input data']);
            return;
        }

        $username = $data['username'] ?? null;
        $full_name = $data['full_name'] ?? null;
        $bio = $data['bio'] ?? null;

        if (!$username || !$full_name || $bio === null) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        $user = new User();
        $result = $user->update($userId, $username, $full_name, $bio);

        echo json_encode($result);
    }

    public function uploadProfilePicture() {
        $headers = getallheaders();
        $jwt = null;

        if (isset($headers['Authorization'])) {
            $jwt = str_replace('Bearer ', '', $headers['Authorization']);
        }

        if (!$jwt) {
            http_response_code(401);
            echo json_encode(['error' => 'Token not provided']);
            return;
        }

        $jwtService = new JWTService();
        $decoded = $jwtService->decodeJWT($jwt);

        if (!$decoded || !isset($decoded->user_id)) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $userId = $decoded->user_id;

        if (!isset($_FILES['profile_picture'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            return;
        }

        $file = $_FILES['profile_picture'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type']);
            return;
        }

        $uploadDir = __DIR__ . '/../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $filename = uniqid('profile_', true) . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
        $filepath = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            $relativePath = '/uploads/' . $filename;

            $user = new User();
            $result = $user->updateProfilePicture($userId, $relativePath);

            echo json_encode($result);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to upload file']);
        }
    }


    public function getUserById($id) {
        $headers = getallheaders();
        $jwt = null;

        if (isset($headers['Authorization'])) {
            $jwt = str_replace('Bearer ', '', $headers['Authorization']);
        }

        if (!$jwt) {
            http_response_code(401);
            echo json_encode(['error' => 'Token not provided']);
            return;
        }

        $jwtService = new JWTService();
        $decoded = $jwtService->decodeJWT($jwt);

        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $user = new User();
        $userData = $user->getById($id);

        if ($userData) {
            echo json_encode($userData);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    }
}

