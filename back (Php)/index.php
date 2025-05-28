<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/Services/Router.php';
require_once __DIR__ . '/vendor/autoload.php';

$router = new Router();

//auth

$router->addRoute('POST', '/api/register', 'AuthController', 'register');
$router->addRoute('POST', '/api/login', 'AuthController', 'login');
$router->addRoute('POST', '/api/refresh', 'AuthController', 'refreshToken');
$router->addRoute('GET', '/api/user', 'AuthController', 'getUser');

//user
$router->addRoute('PUT', '/api/user/update', 'UserController', 'updateProfile');
$router->addRoute('POST', '/api/upload-profile-picture', 'UserController', 'uploadProfilePicture');
$router->addRoute('GET', '/api/user/{id}', 'UserController', 'getUserById');

// post
$router->addRoute('POST', '/api/posts/create', 'PostController', 'createPost');
$router->addRoute('GET', '/api/posts', 'PostController', 'getAllPosts');
$router->addRoute('GET', '/api/posts/show', 'PostController', 'getPostById');
$router->addRoute('DELETE', '/api/posts/delete', 'PostController', 'deletePost');

// comment routes
$router->addRoute('GET', '/api/comments', 'PostController', 'getComments'); // ?post_id=...
$router->addRoute('POST', '/api/comments/create', 'PostController', 'createComment');
$router->addRoute('PUT', '/api/comments/update', 'PostController', 'updateComment');
$router->addRoute('POST', '/api/comments/delete', 'PostController', 'deleteComment');

// friendship routes
$router->addRoute('POST', '/api/friends/send',   'FriendshipController', 'sendFriendRequest');
$router->addRoute('POST', '/api/friends/accept', 'FriendshipController', 'acceptFriendRequest');
$router->addRoute('POST', '/api/friends/reject', 'FriendshipController', 'rejectFriendRequest');
$router->addRoute('GET',  '/api/friends/list',   'FriendshipController', 'getFriends');

// messages
$router->addRoute('POST',   '/api/messages/send',           'MessageController', 'sendMessage');
$router->addRoute('GET',    '/api/messages/conversation',   'MessageController', 'getConversation');
$router->addRoute('PUT',    '/api/messages/{id}',           'MessageController', 'editMessage');
$router->addRoute('DELETE', '/api/messages/{id}',           'MessageController', 'deleteMessage');


$router->dispatch();