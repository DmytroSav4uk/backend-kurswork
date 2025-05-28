<?php
require_once __DIR__ . '/../models/Friendship.php';
require_once __DIR__ . '/../services/JWTService.php';

class FriendshipController
{
    private $friendship;
    private $jwtService;

    public function __construct()
    {
        $this->friendship = new Friendship();
        $this->jwtService = new JWTService();
    }


    public function sendFriendRequest()
    {
        $decoded = $this->jwtService->authorizeRequest();
        $userId = $decoded->user_id;

        $input = json_decode(file_get_contents("php://input"), true);
        $friendId = $input['friend_id'] ?? null;

        if (!$friendId) {
            http_response_code(400);
            echo json_encode(['error' => 'Friend ID is required']);
            return;
        }

        $result = $this->friendship->sendRequest($userId, $friendId);

        echo json_encode(['message' => 'Friend request sent', 'request_id' => $result]);
    }


    public function acceptFriendRequest()
    {
        $decoded = $this->jwtService->authorizeRequest();
        $userId = $decoded->user_id;

        $input = json_decode(file_get_contents("php://input"), true);
        $friendId = $input['friend_id'] ?? null;

        if (!$friendId) {
            http_response_code(400);
            echo json_encode(['error' => 'Friend ID is required']);
            return;
        }

        $result = $this->friendship->acceptRequest( $userId,$friendId);

        if ($result) {
            echo json_encode(['message' => 'Friend request accepted']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to accept request']);
        }
    }


    public function rejectFriendRequest()
    {
        $decoded = $this->jwtService->authorizeRequest();
        $userId = $decoded->user_id;

        $input = json_decode(file_get_contents("php://input"), true);
        $friendId = $input['friend_id'] ?? null;

        if (!$friendId) {
            http_response_code(400);
            echo json_encode(['error' => 'Friend ID is required']);
            return;
        }

        $result = $this->friendship->rejectRequest($friendId, $userId);

        if ($result) {
            echo json_encode(['message' => 'Friend request rejected']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to reject request']);
        }
    }


    public function getFriends()
    {
        $decoded = $this->jwtService->authorizeRequest();
        $userId = $decoded->user_id;

        $friends = $this->friendship->getFriends($userId);

        echo json_encode(['friends' => $friends]);
    }
}
