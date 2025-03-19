<?php
require_once '../auth.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(["user" => null]);
    exit();
}

echo json_encode(["user" => $_SESSION['user']]);
?>
