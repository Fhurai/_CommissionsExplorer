<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *"); // Ajout crucial
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Max-Age: 86400"); // Cache pendant 24h
    exit(0);
}

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json; charset=utf-8');

require_once "./utilitaires.php";

$artist = getFormParameter("artist");
$pathCommission = json_decode(file_get_contents("api.json"), true)['commissions'];

if($artist){
    $folder = explorePath($pathCommission.$artist, true);
    echo json_encode($folder);
}else{
    http_response_code(500);
    echo json_encode(['error' => 'Artist not reckognized ']);
}