<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

$db_file = 'todos.sqlite';

// connect database
try {
    $pdo = new PDO("sqlite:$db_file");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE
    )");
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(["error" => "Database connection error: " . $e->getMessage()]));
}

// handle RESTful api requests with payload body
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// CURD operations
switch ($method) {
    case 'GET':
        $query = $pdo->query("SELECT * FROM todos");
        $todos = $query->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($todos);
        break;

    case 'POST':
        $task = $input['task'] ?? '';

        // return bad request if the task is empty
        if (empty($task)) {
            http_response_code(400);
            echo json_encode(["error" => "Task cannot be empty"]);
            break;
        }

        $query = $pdo->prepare("INSERT INTO todos (task) VALUES (?)");

        // sql injection safe
        if ($query->execute([$task])) {
            $task_id = $pdo->lastInsertId();
            echo json_encode([
                "message" => "Todo added successfully",
                "id" => $task_id,
                "task" => $task,
                "is_completed" => false,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error adding todo: " . $query->errorInfo()[2]]);
        }

        break;

    case 'PUT':
        $id = $input['id'] ?? null;
        $task = $input['task'] ?? null;
        $is_completed = isset($input['is_completed']) ? (bool)$input['is_completed'] : null;

        // stop if no id
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID is required for update"]);
            break;
        }

        $query = $pdo->prepare("UPDATE todos SET task = ?, is_completed = ? WHERE id = ?");
        if ($query->execute([$task, $is_completed, $id])) {
            echo json_encode(["message" => "Todo updated successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error updating todo: " . $query->errorInfo()[2]]);
        }

        break;

    case 'DELETE':
        $id = $input['id'] ?? null;

        // stop if no id
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID is required"]);
            break;
        }

        $query = $pdo->prepare("DELETE FROM todos WHERE id = ?");
        if ($query->execute([$id])) {
            echo json_encode(["message" => "Todo deleted successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error deleting todo: " . $query->errorInfo()[2]]);
        }

        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
