<?php
/**
 * Serve the text file commissions into utf-8 texts to show them without special characters.
 */
$_POST = json_decode(file_get_contents('php://input'), true);

// Get the link of the text commission.
$link = "../".$_POST["link"];

// Set the header for the text to show.
header('Content-type: plain/text; charset=utf-8');

// User alerted everything went fine with text from commission.
echo json_encode(["message" => "OK", "text" => nl2br(file_get_contents($link))]);