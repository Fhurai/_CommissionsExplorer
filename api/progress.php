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

$repositories = json_decode(file_get_contents("api.json"), true);

$action = getFormParameter("action");
$artist = getFormParameter("artist");
$progress = 0.0;

switch($action){
    case "thumbnails":
        $commFolder = explorePath($repositories["commissions"].$artist);
        
        if(!is_dir($repositories["thumbs"].$artist)){
            mkdir($repositories["thumbs"].$artist, 0755, true);
        } 
        $thumbsFolder = explorePath($repositories["thumbs"].$artist);
        
        $progress = count($thumbsFolder) / count($commFolder);
        break;
    default:
        throw new Exception("Unknown action");
}

echo json_encode($progress);