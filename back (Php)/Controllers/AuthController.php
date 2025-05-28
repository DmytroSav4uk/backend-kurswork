<?php
require_once __DIR__ . '/../Models/User.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController {
    private $secretKey = 'your-secret-keyveryverysuperajaafghfd21897253kln!!!jknsef';
    private $issuer = 'social_media_course_work';
    private $audience = 'teachers';

    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            return;
        }

        $username = $data['username'] ?? null;
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        $fullName = $data['full_name'] ?? null;
        $bio = $data['bio'] ?? null;
        $profilePicture = isset($data['profile_picture']) ? base64_decode($data['profile_picture']) : null;

        if (!$username || !$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        $user = new User();
        $result = $user->create(
            $username,
            $email,
            password_hash($password, PASSWORD_DEFAULT),
            $fullName,
            $bio,
            $profilePicture
        );

        if (!$result['success']) {
            http_response_code(409); // 409 Conflict
            echo json_encode(['error' => $result['message']]);
            return;
        }

        echo json_encode(['id' => $result['id'], 'message' => 'User created']);
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid login data']);
            return;
        }

        $user = new User();
        $userData = $user->getByEmail($data['email']);

        if ($userData && password_verify($data['password'], $userData['password_hash'])) {
            $accessToken = $this->generateJWT($userData['id']);
            $refreshToken = $this->generateRefreshToken($userData['id']);

            echo json_encode([
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'expires_in' => 10800,
                'refresh_expires_in' => 14400
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['message' => 'Invalid credentials']);
        }
    }

    public function refreshToken() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['refresh_token'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No refresh token provided']);
            return;
        }

        $refreshToken = $data['refresh_token'];

        if ($this->isValidRefreshToken($refreshToken)) {
            $decoded = JWT::decode($refreshToken, new Key($this->secretKey, 'HS256'));
            $newAccessToken = $this->generateJWT($decoded->user_id);
            echo json_encode(['access_token' => $newAccessToken, 'expires_in' => 10800]);
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid refresh token']);
        }
    }

    public function getUser() {
        $headers = getallheaders();
        $jwt = null;

        if (isset($headers['Authorization'])) {
            $jwt = str_replace('Bearer ', '', $headers['Authorization']);
        }

        if ($jwt) {
            try {
                $decoded = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
                $user = new User();
                $userData = $user->getById($decoded->user_id);
                echo json_encode($userData);
            } catch (Exception $e) {
                http_response_code(401);
                echo json_encode(['message' => 'Invalid or expired token']);
            }
        } else {
            http_response_code(401);
            echo json_encode(['message' => 'Token not provided']);
        }
    }

    private function generateJWT($userId): string {
        $issuedAt = time();
        $expirationTime = $issuedAt + 10800; // 3 години
        $payload = [
            'iss' => $this->issuer,
            'aud' => $this->audience,
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'user_id' => $userId
        ];

        return JWT::encode($payload, $this->secretKey, 'HS256');
    }

    private function generateRefreshToken($userId): string {
        $issuedAt = time();
        $expirationTime = $issuedAt + 14400; // 4 години
        $payload = [
            'iss' => $this->issuer,
            'aud' => $this->audience,
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'user_id' => $userId
        ];

        return JWT::encode($payload, $this->secretKey, 'HS256');
    }

    private function isValidRefreshToken($token): bool {
        try {
            JWT::decode($token, new Key($this->secretKey, 'HS256'));
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
