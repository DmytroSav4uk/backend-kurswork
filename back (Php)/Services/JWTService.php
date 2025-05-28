<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTService {

    private $secretKey = ''; // key


    public function decodeJWT($jwtToken) {
        try {

            $decoded = JWT::decode($jwtToken, new Key($this->secretKey, 'HS256'));
            return $decoded;
        } catch (Exception $e) {

            return null;
        }
    }

    public function generateJWT($userId): string {
        $issuedAt = time();
        $expirationTime = $issuedAt + 10800;
        $payload = [
            'iss' => 'social_media_course_work',
            'aud' => 'teachers',
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'user_id' => $userId
        ];

        return JWT::encode($payload, $this->secretKey, 'HS256');
    }


    public function authorizeRequest() {
        $headers = apache_request_headers();

        if (!isset($headers['Authorization'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Authorization header missing']);
            exit;
        }

        $authHeader = $headers['Authorization'];
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid Authorization header format']);
            exit;
        }

        $jwtToken = $matches[1];
        $decoded = $this->decodeJWT($jwtToken);

        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            exit;
        }

        return $decoded;
    }


}

