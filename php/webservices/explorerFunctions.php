<?php

/**
 * Method to get artists visible with provided token.
 * @Exception Exception if sfw.json don't exist. Trigger generate functions.
 */
function getArtistsTokenArray(string $token){
	
	// Get the content of sfw json file.
	$artists = file_get_contents("../sfw.json");

	if(isNsfwTokenValid($token)){
		// If nsfw token is valid, all artists in sfw json are returned.
		return json_decode($artists, true);
	}else{
		// If nsfw token is not valid, all artists in sfw json got.
		$artistsArray = json_decode($artists, true);
		
		foreach($artistsArray as $artist => $sfw){
			// Browse the artist of the sfw json file.
			
			// If the artist is not sfw, they are removed from the artists array
			if(!$sfw) unset($artistsArray[$artist]);
		}
		
		// Filtered array returned.
		return $artistsArray;
	}
}

/**
 * Method to check if nsfw token is valid.
 * @Exception Exception if sfw.json don't exist. Trigger generate functions.
 */
function isNsfwTokenValid(string $token){
	
	// Get the content of nsfw json file.
	$nsfw = file_get_contents("../nsfw.json");
	
	// Return if provided $token is the nsfw token in file.
	return $token === $nsfw;
}

/**
 * Method to get the thumbnails for a artist commissions.
 */
function getThumbnail($artist){
	
	// Default : the folder thumbnail is a folder icon.
	$thumbnail = "icons/folder.png";
	
	if(is_dir("../../thumbs/$artist")){
		// If the artist name provided is linked to a folder, browsing of its content.
	
		// Recuperation of all files in artist folder.
		$files = array_diff(scandir("../../thumbs/$artist"), [".", ".."]);
		
		foreach($files as $file){
			// Get the extension of the file.
			$extension = pathinfo($file, PATHINFO_EXTENSION);
			
			if(!empty($extension) && $extension !== "db"){
				// File has extension, it has a thumbnail.
				$thumbnail = "thumbs/".$artist."/".$file;
				
				// Thumbnail found for artist folder, break of the liip.
				break;
			}else{
				// File has no extension, this is a folder.
				
				// Need to go deeper for thumbnail.
				$thumbnail = getThumbnail($artist."/".$file);
			}
		}
	}
	
	// Return the thumbnail file after the browsing of the artist files.
	return $thumbnail;
}

/**
 * Method to check if the admin password is valid.
 */
function verifyAdmin($password){
	// Initialization of parameters for encryption.
	$pass           = 'FhuraiIsDoneWithThisShit';
	$method         = 'aes-128-cbc';
	$initVector     = "0123456789012345";
	
	// Encrypt of the artists name as a token
	$encrypted      = urlencode(openssl_encrypt($password, $method, $pass, false, $initVector));
	
	// Recuperation of admin password from json file.
	$admin = file_get_contents("../admin.json");
	
	// Return if provided password.
	return $encrypted === $admin;
}