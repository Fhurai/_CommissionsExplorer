<?php
// CORS headers must be at the TOP
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

require_once "./utilitaires.php";

$artists = json_decode(file_get_contents("sfw.json"), true);

$artists = array_filter($artists, function($artist): bool{
    return $artist === (!getQueryParameter("isNsfw") || getQueryParameter("isNsfw") !== "true");
});

foreach($artists as $artist => $sfw){
    $isDir = is_dir("../thumbs/".$artist);
    if($isDir){
        $folder = explorePath("../thumbs/".$artist);
        sort($folder);
        $artists[$artist] = array_key_exists(0, $folder) ? $folder[0] : "./assets/img/folder.png";
    }else{
        $artists[$artist] = "./assets/img/folder.png";
    }
    
}

ksort($artists, SORT_NATURAL | SORT_FLAG_CASE);

echo json_encode($artists);