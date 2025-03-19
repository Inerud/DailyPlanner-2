<?php
// Include Auth0 SDK files
require_once 'auth0/src/Auth0.php';
require_once 'auth0/src/Helpers/JWTVerifier.php';
require_once 'auth0/src/Helpers/Token.php';
require_once 'auth0/src/Store/SessionStore.php';
require_once 'auth0/scr/Configuration/SdkConfiguration.php';

use Auth0\SDK\Auth0;
use Auth0\SDK\Configuration\SdkConfiguration;

// Auth0 Configuration
$auth0 = new Auth0([
    'domain'        => (getenv('AUTH0_DOMAIN')),
    'client_id'     => (getenv('AUTH0_CLIENT_ID')),
    'client_secret' => (getenv('AUTH0_CLIENT_SECRET')),
    'redirect_uri'  => (getenv('AUTH0_BASE_URL')),
    'scope'         => 'openid profile email',
    'store'         => new \Auth0\SDK\Store\SessionStore(),
]);

require_once "db.php";
session_start();

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