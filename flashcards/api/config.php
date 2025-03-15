<?php
$host = 'mysql.stud.ntnu.no';
$username = 'mohandm_user1';  // replace with your DB username
$password = 'MomoAdmin';     // replace with your DB password
$database = 'mohandm_database'; // replace with your DB name

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
