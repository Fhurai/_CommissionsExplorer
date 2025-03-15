<?php
// CORS headers must be at the TOP
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

require_once "./utilitaires.php";

$json = json_decode(file_get_contents("sfw.json"), true);

$repository = array_diff(scandir(json_decode(file_get_contents("api.json"), true)["commissions"]), [".", "..", "dummy.txt"]);

$news = [];

foreach($repository as $artist){
    if(!array_key_exists($artist, $json)){
        $news[$artist] = false;
        $json[$artist] = false;
    }
}

ksort($json, SORT_NATURAL | SORT_FLAG_CASE);
file_put_contents("sfw.json", json_encode($json));

echo json_encode($news);