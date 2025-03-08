<?php

// Import the explorer functions.
require_once "explorerFunctions.php";

// Recuperation of the arguments of the Ajax call.
$_POST = json_decode(file_get_contents('php://input'), true);

// Recuperation of the password to use?.
$password = $_POST["password"];

// Verification of the admin login.
$isConnected = verifyAdmin($password);

// User alerted process went well and if they are connected as admin.
echo json_encode(["code" => "OK", "admin" => $isConnected]);