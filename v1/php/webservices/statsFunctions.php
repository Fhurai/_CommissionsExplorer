<?php

/**
 * Method to get the count of artwork in a artist folder.
 */
function countArtworks($folder){
	// Return the count of artwork found in $folder.
	return count(getContentFolder($folder));
}

/**
 * Méthode de contenu d'un dossier artiste
 */
function getContentFolder($name){
	// Forbidden files to get in folder.
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