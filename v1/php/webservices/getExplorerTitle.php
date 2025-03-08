<?php
// CORS headers must be at the TOP
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    require_once "explorerFunctions.php";
    
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Validate input
    if (!isset($data['token'])) {
        http_response_code(400);
        echo json_encode(["code" => "ERROR", "message" => "Token parameter required"]);
        exit;
    }

    $token = $data['token'];
    $title = "Fhurai's SFW Commissions ";

    if(isNsfwTokenValid($token)) {
        $title = "Fhurai's Commissions, SFW & NSFW";
    }

    echo json_encode(["code" => "OK", "title" => $title]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["code" => "ERROR", "message" => "Server error: " . $e->getMessage()]);
}