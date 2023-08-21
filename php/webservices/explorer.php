<?php

// Import the explorer functions.
require_once "explorerFunctions.php";

// Recuperation of the arguments of the Ajax call.
$_POST = json_decode(file_get_contents('php://input'), true);

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

// send the artists informations array as a json file.
echo json_encode($artists);