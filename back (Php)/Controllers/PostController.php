<?php
require_once __DIR__ . '/../Models/Post.php';
require_once __DIR__ . '/../Models/Comment.php';
require_once __DIR__ . '/../Services/JWTService.php';

class PostController
{
    public function createPost()
    {
        $headers = getallheaders();
        $jwt = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

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

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $content = $_POST['content'] ?? '';
            $image = null;

            if (isset($_FILES['image'])) {
                $file = $_FILES['image'];
                $allowedTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/jpg',
                    'image/gif',
                    'video/mp4',
                    'video/webm',
                    'video/avi'
                ];


                if (!in_array($file['type'], $allowedTypes)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid image type']);
                    return;
                }

                $uploadDir = __DIR__ . '/../uploads/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                $filename = uniqid('post_', true) . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
                $filepath = $uploadDir . $filename;

                if (move_uploaded_file($file['tmp_name'], $filepath)) {
                    $image = '/uploads/' . $filename;
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to upload image']);
                    return;
                }
            }

            $post = new Post();
            $postId = $post->create($userId, $content, $image);

            echo json_encode(['message' => 'Post created', 'post_id' => $postId]);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Invalid request method']);
        }
    }

    public function getPostById()
    {
        $id = $_GET['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Post ID is required']);
            return;
        }

        $post = new Post();
        $result = $post->getById($id);

        if ($result) {
            echo json_encode($result);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Post not found']);
        }
    }

    public function getAllPosts()
    {
        $jwtService = new JWTService();
        $userData = $jwtService->authorizeRequest();

        $post = new Post();
        $results = $post->getAll();
        echo json_encode($results);
    }

    public function getComments()
    {
        $postId = $_GET['post_id'] ?? null;

        if (!$postId) {
            http_response_code(400);
            echo json_encode(['error' => 'Post ID is required']);
            return;
        }

        $commentModel = new Comment();
        $comments = $commentModel->getByPostId($postId);
        echo json_encode($comments);
    }

    public function createComment()
    {
        $headers = getallheaders();
        $jwt = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

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


        $input = json_decode(file_get_contents("php://input"), true);
        $postId = $input['post_id'] ?? null;
        $content = $input['content'] ?? '';

        if (!$postId || !$content) {
            http_response_code(400);
            echo json_encode(['error' => 'Post ID and content are required']);
            return;
        }

        $commentModel = new Comment();
        $commentId = $commentModel->create($postId, $userId, $content);

        echo json_encode(['message' => 'Comment created', 'comment_id' => $commentId]);
    }

    public function updateComment()
    {
        $headers = getallheaders();
        $jwt = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

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


        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $commentId = $data['comment_id'] ?? null;
        $newContent = $data['content'] ?? '';

        if (!$commentId || !$newContent) {
            http_response_code(400);
            echo json_encode(['error' => 'Comment ID and new content are required']);
            return;
        }

        $userId = $decoded->user_id;
        $commentModel = new Comment();
        $success = $commentModel->update($commentId, $userId, $newContent);

        if ($success) {
            echo json_encode(['message' => 'Comment updated']);
        } else {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized or comment not found']);
        }
    }


    public function deleteComment()
    {
        $headers = getallheaders();
        $jwt = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

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

        $input = json_decode(file_get_contents('php://input'), true);

        $commentId = $input['comment_id'] ?? null;
        $postId = $input['post_id'] ?? null;

        if (!$commentId || !$postId) {
            http_response_code(400);
            echo json_encode(['error' => 'Comment ID and Post ID are required']);
            return;
        }

        $commentModel = new Comment();
        $success = $commentModel->delete($commentId, $userId, $postId);

        if ($success) {
            echo json_encode(['message' => 'Comment deleted']);
        } else {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized or comment not found']);
        }
    }


    public function deletePost()
    {
        $headers = getallheaders();
        $jwt = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

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
        $postId = $_GET['id'] ?? null;

        if (!$postId) {
            http_response_code(400);
            echo json_encode(['error' => 'Post ID is required']);
            return;
        }

        $post = new Post();
        $success = $post->delete($postId, $userId);

        if ($success) {
            echo json_encode(['message' => 'Post deleted successfully']);
        } else {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized or post not found']);
        }
    }


}
