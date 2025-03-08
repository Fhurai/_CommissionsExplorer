<?php

// Import the stats functions.
require_once "statsFunctions.php";

// Get all artists names in repository.
$artists = array_diff(scandir("../../Commissions"), [".", ".."]);

// Recuperation of the count of artists in repository.
$stats = array();
$stats["artists_total"] = count($artists);

// Initialization of total count of artworks.
$stats["artworks"] = 0;

// Browse the artists folders in repository.
foreach($artists as $artist){
	
	// Count the artworks in artist folder.
	$count = countArtworks("../../Commissions/".$artist);
	
	// Add artist artworks count in total count.
	$stats["artworks"] += $count;
	
	// Add artist artworks count in stats array.
	$stats["artists"][$artist] = $count;
}

// Initialization of json stats array
$json = array();

// Recuperation of json content array for sfw.
$sfwContent = json_decode(file_get_contents("../sfw.json"), true);

// Initialization of stats array for json sfw file.
$json["sfw_artists"] = 0;
$json["sfw_artworks"] = 0;
$json["nsfw_artists"] = 0;
$json["nsfw_artworks"] = 0;

// Recuperation of json content array for twitter.
$twitterContent = json_decode(file_get_contents("../twitter.json"), true);

// Initialization of stats array for json twitter file.
$json["twitter"] = 0;
$json["no_twitter"] = 0;

// Browse the sfw file content
foreach($sfwContent as $artist => $sfw){
	
	if($sfw){
		// If artist is sfw, count of sfw artists is incremented and their artworks count is added to sfw artworks count.
		$json["sfw_artists"]++;
		$json["sfw_artworks"] += $stats["artists"][$artist];
	}else{
		// If artist is nsfw, count of nsfw artists is incremented and their artworks count is added to nsfw artworks count.
		$json["nsfw_artists"]++;
		$json["nsfw_artworks"] += $stats["artists"][$artist];
	}
	
	if($twitterContent[$artist] !== ""){
		// If artist has twitter link, count of twitter artists is incremented.
		$json["twitter"]++;
	}else{
		// If artist has no twitter link, count of no twitter artists is incremented.
		$json["no_twitter"]++;
	}
}

// Return JSON file of stats.
echo json_encode(["repository" => $stats, "json" => $json]);