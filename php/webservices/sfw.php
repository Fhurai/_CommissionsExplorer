<?php

// Recuperation of the arguments of the Ajax call.
$_POST = json_decode(file_get_contents('php://input'), true);

// Recuperation of the content to save.
$save = $_POST["save"];

// Set the json file to edit.
$path = "../sfw.json";

// Opening of the json file.
$fp = fopen($path, "w");

// Pointer to the beginning of the file.
fseek($fp, 0);

// Content written in json file.
fwrite($fp, $save);

// Closing of the json file.
fclose($fp);

// User alerted everything went fine.
echo json_encode(["code" => "OK"]);