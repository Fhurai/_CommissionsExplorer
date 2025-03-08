<?php

// Set the content type to JSON
header('Content-Type: application/json');

// Import the explorer functions.
require_once "explorerFunctions.php";

// Recuperation of the arguments of the Fetch API call.
$_POST = json_decode(file_get_contents('php://input'), true);

// Check if the token is provided in the request
if (!isset($_POST["token"])) {
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "Token is required"]);
    exit();
}

// Recuperation of the token to use.
$token = $_POST["token"];

// Recuperation of all accessible artists with provided token.
$artists = getArtistsTokenArray($token);

// If Twitter json file exists, recuperation of its content. If not, new array created.
$twitters = file_exists("../twitter.json") ? json_decode(file_get_contents("../twitter.json"), true) : array();

foreach($artists as $artist => $data){
    // Browsing of artists folders.
    
    // Creation of the artist entry in the artists informations array
    $artists[$artist] = [
        "sfw" => $data,
        "thumbnail" => getThumbnail($artist),
        "twitter" => array_key_exists($artist, $twitters) ? $twitters[$artist] : ""
    ];
}

// Send the artists informations array as a JSON response.
echo json_encode($artists);