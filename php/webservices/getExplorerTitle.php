<?php

// Import the explorer functions.
require_once "explorerFunctions.php";

// Recuperation of the arguments of the Ajax call.
$_POST = json_decode(file_get_contents('php://input'), true);

// Recuperation of the token for nsfw content.
$token = $_POST["token"];

// SFW title for default.
$title = "Fhurai's SFW Commissions ";


if(isNsfwTokenValid($token)){
	// If NSFW token is valid, change title to show this is the nsfw side.
	$title = "Fhurai's Commissions, SFW & NSFW";
}

// User alert everything went fine and send the title.
echo json_encode(["code" => "OK", "title" => $title]);