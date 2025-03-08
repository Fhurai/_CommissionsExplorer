<?php
// CORS headers must be at the TOP
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

require_once "./utilitaires.php";

$api = json_decode(file_get_contents("sfw.json"), true);

$api = array_filter($api, function($artist): bool{
    return $artist === (!getQueryParameter("isNsfw") || getQueryParameter("isNsfw") !== "true");
});

echo json_encode($api);