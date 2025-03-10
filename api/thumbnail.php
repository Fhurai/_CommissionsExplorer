<?php
// CORS headers must be at the TOP
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

require_once "./utilitaires.php";

$artwork = getFormParameter("artwork");
$pathCommission = json_decode(file_get_contents("api.json"), true)['thumbs'];

$json = [];

if(!$artwork){
    $artworks = getFormParameter("artworks");
    foreach($artworks as $artwork){
        $json[] = getFullPaths($artwork);
    }
}else{
    $json[] = getFullPaths($artwork);
}

echo json_encode($json);