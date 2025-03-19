<?php
header("Content-Type: application/json");
require_once "server/config/db.php";
require_once "server/auth/auth.php";

// Handle requests
$request_method = $_SERVER["REQUEST_METHOD"];
$request_uri = $_SERVER["REQUEST_URI"];

// Journal Entries
if ($request_uri == "/api/journal" && $request_method == "POST") {
    $user_id = authenticateUser();
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data["entryTitle"]) || empty($data["entry"])) {
        echo json_encode(["success" => false, "message" => "Title and entry required"]);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO journal_entries (user_id, entry_title, entry) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $user_id, $data["entryTitle"], $data["entry"]);
    $stmt->execute();
    echo json_encode(["success" => true, "message" => "Journal entry saved!"]);
    exit();
}

if ($request_uri == "/api/journal" && $request_method == "GET") {
    $user_id = authenticateUser();

    $stmt = $conn->prepare("SELECT id, entry_title, entry, created_at FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $entries = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode(["entries" => $entries]);
    exit();
}

// To-Do List
if ($request_uri == "/api/todos" && $request_method == "POST") {
    $user_id = authenticateUser();
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data["description"]) || empty($data["date"])) {
        echo json_encode(["success" => false, "message" => "Description and date are required"]);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO todos (user_id, date, time, priority, description, completed, recurring) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssis", $user_id, $data["date"], $data["time"], $data["priority"], $data["description"], $data["completed"], $data["recurring"]);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "To-do added!", "id" => $stmt->insert_id]);
    exit();
}

if ($request_uri == "/api/todos" && $request_method == "GET") {
    $user_id = authenticateUser();

    $stmt = $conn->prepare("SELECT * FROM todos WHERE user_id = ? ORDER BY date, time");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $todos = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode(["success" => true, "todos" => $todos]);
    exit();
}

// Account Details
if ($request_uri == "/api/account" && $request_method == "GET") {
    $user_id = authenticateUser();

    $stmt = $conn->prepare("SELECT name, email FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    echo json_encode(["success" => true, "user" => $user]);
    exit();
}

if ($request_uri == "/api/account" && $request_method == "PUT") {
    $user_id = authenticateUser();
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data["name"]) || empty($data["email"])) {
        echo json_encode(["success" => false, "message" => "Name and email are required"]);
        exit();
    }

    $stmt = $conn->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
    $stmt->bind_param("ssi", $data["name"], $data["email"], $user_id);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Account details updated successfully!"]);
    exit();
}

// 404 Not Found
http_response_code(404);
echo json_encode(["success" => false, "message" => "Invalid API endpoint"]);
?>
