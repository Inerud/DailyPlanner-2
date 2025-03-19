<?php
require 'auth.php';

$user = $auth0->getUser();

if (!$user) {
    header("Location: login.php");
    exit();
}

echo "Welcome, " . htmlspecialchars($user['name']);
