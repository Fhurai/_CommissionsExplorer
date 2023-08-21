<?php

// Recuperation of sfw json file as an array.
$sfwContent = json_decode(file_get_contents("../sfw.json"), true);

// Recuperation of twitter json file as an array.
$twitterContent = json_decode(file_get_contents("../twitter.json"), true);

// Date from json files sent to caller as a JSON file.
echo json_encode(["sfw" => $sfwContent, "twitter" => $twitterContent]);