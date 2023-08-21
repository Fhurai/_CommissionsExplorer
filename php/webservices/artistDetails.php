<?php

// Import the thumbimage class.
require_once "thumbimage.class.php";

// Set the memory limit to max available.
ini_set('memory_limit', '-1');

// Recuperation of the arguments of the Ajax call.
$_POST = json_decode(file_get_contents('php://input'), true);

// Recuperation of the artist to get.
$artist = $_POST["artist"];

/**
 * Method to get the content of an artist folder.
 */
function getContentFolder($name){
	// Forbidden files
	$forbidden = ['.','..', 'settings.json', '@eaDir', 'Thumbs.db', 'desktop.ini'];
	
	// Forbidden extensions in folder.
	$extensions = [
		// File edition formats.
		'clip', 'CLIP',
		'psd', 'PSD',
		
		// Unknown formats for thumbnails.
		'tif', 'TIF',
		'tiff', 'TIFF',
		
		// 3D formats.
		'fbx', 'FBX',
		'stl', 'STL',
		'ztl', 'ZTL',
		'tga', 'TGA',
		'obj', 'OBJ',
		
		// Compressed files formats.
		'7z', '7Z',
		'zip', 'ZIP',
	];

	// Scan of folder excluding the forbidden files.
	$folders = array_diff(scandir($name), $forbidden);

	// Initialization of artworks array.
	$artworks = [];
	
	// Browse the files of the folder
	foreach($folders as $art){
		
		// Get the file extension.
		$extension = pathinfo($art, PATHINFO_EXTENSION);
		
		if(!empty($extension)){
			// Extension exists so this is a file to get.
			
			
			if(!in_array($extension, $extensions)){
				// Extension is not one to ban.
				
				// File added to the list of artworks to show.
				$artworks[] = substr($name."/".$art, 2);	
			}
		}else{
			// No extension, this is a folder.
			$artworks = array_merge($artworks, getContentFolder($name."/".$art));
		}
	}
	
	// Return the list of artworks.
	return $artworks;
}


/**
 * THUMBS CREATION
 */

if($artist !== null){
	// If provided artist name is not null, we can get details.
	
	// Get content of artist folder.
	$contents = getContentFolder("../../Commissions/".$artist);

	if(!is_dir("../../thumbs/".$artist)){
		// If artist has no thumbnail folder, one is created.
		$result = mkdir("../../thumbs/".$artist, 0777, true);
	}

	foreach($contents as $art){
		// Browsing the content of the folder.
		
		// Get the file extension.
		$extension = pathinfo($art, PATHINFO_EXTENSION);
			
		if(!file_exists("../../thumbs/".substr($art, 16)) && !in_array($extension, ["wav", "WAV", "mp3", "MP3", "mp4", "MP4", "mov", "MOV", "txt", "TXT"])){
			// If thumbnail doesn't exist and its extension is for a picture.
			
			// Link to artwork is cut into an array.
			$arrayUrl = explode("/", $art);
			
			// Change of folder for the array (original -> thumbnail).
			$arrayUrl[2] = "thumbs";
			
			// Thumbnail link recreated from thummbnail.
			$thumbnail = implode("/", $arrayUrl);
			
			// Remove artwork from array.
			unset($arrayUrl[count($arrayUrl) - 1]);
			
			// Recreation of thumbnail folder link from array.
			$dir = implode("/", $arrayUrl);
			
			// Initialiaztion of result to true.
			$result = true;
			
			if(!is_dir("..".$dir))
				// If folder doesn't exist, it is created with result of creation used to be returned.
				$result = mkdir("..".$dir, 0777, true);
			
			if($result){
				// Folder exists, creation of thumbnail.
				$objThumbImage = new ThumbImage("../".$art);
				$objThumbImage->createThumb("..".$thumbnail, 250);
			}
		}
	}
	
	// All thumbnails are send as JSON file to the call.
	echo json_encode($contents);
}else{
	// No artist found the provided name, empty JSON answer.
	echo json_encode(null);
}