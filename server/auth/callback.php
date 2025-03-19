<?php
require 'auth.php';

$auth0->exchange();

$user = $auth0->getUser();

if ($user) {
    $_SESSION['user'] = $user;
    header("Location: dashboard.php");
} else {
    echo "Login failed!";
}