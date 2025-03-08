<?php

// Import the generate functions.
require_once "generateFunctions.php";

// Initialize result
$answer = [false, false, false];

// Call generate sfw json file.
$answer[0] = generateSfwJson();

// Call generate twitter json file.
$answer[1] = generateTwitterJson();

// Get all config files.
$configFolder = scandir("..");

if($answer[0] && $answer[1] && array_search("nsfw.json", $configFolder) === false && array_search("admin.json", $configFolder) === false){
	// If the previous json files were generated and the following are missing, generation of the token to unlock nsfw commissions and admin password.
	$answer[2] = generateToken();
	$answer[2] = generateAdmin("newPassword"); // <-- To change for every user by their own password.
}

// Send the answer to Ajax call.
echo json_encode($answer);