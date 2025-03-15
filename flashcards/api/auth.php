<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if ($action === 'register') {
        // Expect epost and passord
        $epost = $data['epost'] ?? '';
        $passord = $data['passord'] ?? '';
        if (!$epost or !$passord) {
            http_response_code(400);
            echo json_encode("Missing credentials");
            exit;
        }
        // Check if user exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $epost);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            http_response_code(400);
            echo json_encode("User already exists");
            exit;
        }
        $stmt->close();
        
        $hash = password_hash($passord, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
        $stmt->bind_param("ss", $epost, $hash);
        if ($stmt->execute()) {
            echo json_encode("Registration successful");
        } else {
            http_response_code(500);
            echo json_encode("Registration failed");
        }
        exit;
    }
    elseif ($action === 'login') {
        $epost = $data['epost'] ?? '';
        $passord = $data['passord'] ?? '';
        if (!$epost or !$passord) {
            http_response_code(400);
            echo json_encode("Missing credentials");
            exit;
        }
        $stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
        $stmt->bind_param("s", $epost);
        $stmt->execute();
        $stmt->bind_result($id, $hash);
        if ($stmt->fetch() && password_verify($passord, $hash)) {
            $_SESSION['userID'] = $id;
            echo json_encode("Login successful");
        } else {
            http_response_code(401);
            echo json_encode("Invalid credentials");
        }
        $stmt->close();
        exit;
    }
    elseif ($action === 'logout') {
        session_unset();
        session_destroy();
        echo json_encode("Logged out");
        exit;
    }
    elseif ($action === 'reset-password') {
        // This example assumes you perform additional steps (like sending email).
        $epost = $data['epost'] ?? '';
        if (!$epost) {
            http_response_code(400);
            echo json_encode("Missing email");
            exit;
        }
        // For demo purpose, we return success.
        echo json_encode("Password reset link sent to " . $epost);
        exit;
    }
} elseif ($method === 'GET' && $action === 'status') {
    if (isset($_SESSION['userID'])) {
        echo json_encode(["loggedIn" => true, "userID" => $_SESSION['userID']]);
    } else {
        echo json_encode(["loggedIn" => false]);
    }
    exit;
}

http_response_code(400);
echo json_encode("Invalid request");
?>
