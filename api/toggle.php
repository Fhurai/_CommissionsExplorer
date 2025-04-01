<?php
// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *"); // Allow all origins
    header("Access-Control-Allow-Methods: POST, OPTIONS"); // Allow POST and OPTIONS methods
    header("Access-Control-Allow-Headers: Content-Type"); // Allow Content-Type header
    header("Access-Control-Max-Age: 86400"); // Cache preflight response for 24 hours
    exit(0);
}

// Set CORS header for all responses
header("Access-Control-Allow-Origin: *");
// Set content type to JSON
header('Content-Type: application/json; charset=utf-8');

// Include utility functions
require_once "./utilitaires.php";

// Load artists data from JSON file
$json = json_decode(file_get_contents("sfw.json"), true);
$result = 0;

if($json === null){
    // If artists parameter is missing, return an error response
    http_response_code(500);
    echo json_encode(['error' => 'Empty Artists array!']);
}

// Get the 'artist' parameter from the request
$artist = getFormParameter("artist");

if(!$artist){
	// If artist parameter is missing, return an error response
    http_response_code(500);
    echo json_encode(['error' => 'No artist to toggle!']);
}

foreach($json as $key => $value){
	if($key === $artist){
		$json[$key] = !$value;
		$result++;
	}	
}

if($result === 1){
	// Save the updated JSON data back to the file
	file_put_contents("sfw.json", json_encode($json));
	
	echo json_encode(["result" => true]);
} else {
	http_response_code(500);
	echo json_encode(['error' => 'Less than one or more than one artist updated!']);
}