<?php
session_start();
header("Content-Type: application/json");
require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    // Save flashcards
    if ($action === 'save') {
        $userID = $data['userID'] ?? '';
        $flashcards = $data['flashcards'] ?? [];
        if (!$userID) {
            http_response_code(400);
            echo json_encode("Missing userID");
            exit;
        }
        foreach ($flashcards as $card) {
            // Check duplicate before insert
            $stmt = $conn->prepare("SELECT id FROM flashcards WHERE user_id = ? AND question = ? AND answer = ?");
            $stmt->bind_param("iss", $userID, $card['question'], $card['answer']);
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows === 0) {
                $stmt->close();
                $created_at = date("Y-m-d H:i:s");
                $stmt = $conn->prepare("INSERT INTO flashcards (user_id, question, answer, created_at) VALUES (?, ?, ?, ?)");
                if (!$stmt) {
                    http_response_code(500);
                    echo json_encode(["error" => $conn->error]);
                    exit;
                }
                $stmt->bind_param("isss", $userID, $card['question'], $card['answer'], $created_at);
                if (!$stmt->execute()) {
                    http_response_code(500);
                    echo json_encode(["error" => $stmt->error]);
                    exit;
                }
            }
            $stmt->close();
        }
        echo json_encode("Flashcards saved");
        exit;
    }
    // Delete flashcard
    elseif ($action === 'delete') {
        $userID = $data['userID'] ?? '';
        $question = $data['question'] ?? '';
        $answer = $data['answer'] ?? '';
        if (!$userID or !$question or !$answer) {
            http_response_code(400);
            echo json_encode("Missing parameters");
            exit;
        }
        $stmt = $conn->prepare("DELETE FROM flashcards WHERE user_id = ? AND question = ? AND answer = ?");
        $stmt->bind_param("iss", $userID, $question, $answer);
        if ($stmt->execute()) {
            echo json_encode("Flashcard deleted");
        } else {
            http_response_code(500);
            echo json_encode("Delete failed");
        }
        $stmt->close();
        exit;
    }
} elseif ($method === 'GET' && !$action) {
    // Fetch flashcards for a user
    $userID = $_GET['userID'] ?? '';
    if (!$userID) {
        http_response_code(400);
        echo json_encode("Missing userID");
        exit;
    }
    $stmt = $conn->prepare("SELECT question, answer, created_at FROM flashcards WHERE user_id = ?");
    $stmt->bind_param("i", $userID);
    $stmt->execute();
    $result = $stmt->get_result();
    $cards = [];
    while($row = $result->fetch_assoc()){
        $cards[] = $row;
    }
    echo json_encode($cards);
    $stmt->close();
    exit;
}

http_response_code(400);
echo json_encode("Invalid request");
?>
