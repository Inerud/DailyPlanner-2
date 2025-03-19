<?php
require_once 'auth0/src/Auth0.php';
require_once 'auth0/src/Helpers/JWTVerifier.php';
require_once 'auth0/src/Helpers/Token.php';
require_once 'auth0/src/Store/SessionStore.php';
require_once 'auth0/src/Configuration/SdkConfiguration.php';

// Include the dependencies
require_once 'vendor/firebase/src/JWT.php'; 
require_once 'vendor/guzzle/src/Client.php'; 
require_once 'vendor/symfony/HttpFoundation/Request.php';

use Auth0\SDK\Auth0;
use Auth0\SDK\Configuration\SdkConfiguration;

// Start session
session_start();

// Auth0 Configuration
$auth0 = new Auth0([
    'domain'        => getenv('AUTH0_DOMAIN'),
    'client_id'     => getenv('AUTH0_CLIENT_ID'),
    'client_secret' => getenv('AUTH0_CLIENT_SECRET'),
    'redirect_uri'  => getenv('AUTH0_BASE_URL') . '/callback.php',
    'scope'         => 'openid profile email',
    'store'         => new \Auth0\SDK\Store\SessionStore(),
]);

// Handle login
if (isset($_GET['code'])) {
    $userInfo = $auth0->getUser();
    if ($userInfo) {
        $_SESSION['user'] = $userInfo;
        
        // Store user in the database
        require_once "db.php";
        $user_id = getOrCreateUser($userInfo['sub'], $userInfo['email'], $userInfo['name']);
        $_SESSION['user_id'] = $user_id;
        
        header("Location: /dashboard.php");
        exit();
    }
}

// Logout
if (isset($_GET['logout'])) {
    $auth0->logout();
    session_destroy();
    header("Location: /");
    exit();
}

function authenticateUser()
{
    if (!isset($_SESSION['user'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit();
    }
    return $_SESSION['user'];
}

function getOrCreateUser($auth0_id, $email, $name)
{
    global $conn;

    $stmt = $conn->prepare("SELECT id FROM users WHERE auth0_id = ?");
    $stmt->bind_param("s", $auth0_id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($user_id);
        $stmt->fetch();
        $stmt->close();
        return $user_id;
    }

    $stmt->close();

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (auth0_id, email, name) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $auth0_id, $email, $name);
    $stmt->execute();
    $user_id = $stmt->insert_id;
    $stmt->close();

    return $user_id;
}
?>
