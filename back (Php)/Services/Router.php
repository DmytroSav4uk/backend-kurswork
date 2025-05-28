<?php

class Router {
    private $routes = [];

    public function __construct() {
        $this->routes = [
            'POST' => [],
            'GET'  => [],
            'PUT'  => [],
            'DELETE' => []
        ];
    }

    public function addRoute($method, $uri, $controller, $action) {
        $this->routes[$method][$uri] = ['controller' => $controller, 'action' => $action];
    }

    public function dispatch() {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $method = $_SERVER['REQUEST_METHOD'];

        foreach ($this->routes[$method] as $route => $action) {

            $pattern = '#^' . preg_replace('/{(\w+)}/', '(?P<$1>\w+)', $route) . '$#';

            if (preg_match($pattern, $uri, $matches)) {

                $controllerName = $action['controller'];
                $actionName = $action['action'];

                require_once __DIR__ . '/../Controllers/' . $controllerName . '.php';
                $controller = new $controllerName();


                $params = array_values(array_filter($matches, function($key) {
                    return !is_int($key);
                }, ARRAY_FILTER_USE_KEY));


                call_user_func_array([$controller, $actionName], $params);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
    }
}
