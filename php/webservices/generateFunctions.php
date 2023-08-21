<?php

/**
 * Method to generate the SFW json file
 */
function generateSfwJson(){
	
	// Initialization of json file.
	$file = "sfw.json";
	
	// Initialization of json file path.
	$path = "../".$file;
	
	try{
		// Find all files in parent directory of current directory.
		$files = scandir("..");
		
		// Search if sfw.json exists.
		$key = array_search($file, $files);
		
		if($key !== false){
			// If file exists, get the content.
			$content = file_get_contents($path);
		}else{
			// File doesn't exist, the content is created.
			$content = "{}";
		}
		
		// Format of the content into an array
		$contentArray = json_decode($content, true);
		
		// Check if one or more artist folder was added to repository.
		$diff = array_diff(getArtistsArray(), array_keys($contentArray), [".", ".."]);
		
		if(!empty($diff)){
			// If one artist added or more.
			
			foreach($diff as $artist){
				// Browse of the added artists and parameters added to json content.
				$contentArray[$artist] = false;
			}
			
			// Sort of the keys of the json file
			ksort($contentArray);
			
			// Content added to json file.
			$fp = fopen($path, "w");
			
			// Pointer at the beginning of the file.
			fseek($fp, 0);
			
			// Writing of the content in json file.
			fwrite($fp, json_encode($contentArray));
			
			// Closing the json file.
			fclose($fp);
			
			// Changed happened and everything went well.
			return true;
		}else{
			// No changes happened.
			return false;
		}
	}catch(Exception $e){
		// Exception thrown, no change
		return false;
	}
}

/**
 * Method to generate the Twitter json file
 */
function generateTwitterJson(){
	// Initialization of json file.
	$file = "twitter.json";
	
	// Initialization of json file path.
	$path = "../".$file;
	
	try{
		// Find all files in parent directory of current directory.
		$files = scandir("..");
		
		// Search if twitter.json exists.
		$key = array_search($file, $files);
		
		if($key !== false){
			// If file exists, get the content.
			$content = file_get_contents($path);
		}else{
			// File doesn't exist, the content is created.
			$content = "{}";
		}
		
		// Format of the content into an array
		$contentArray = json_decode($content, true);
		
		// Check if one or more artist folder was added to repository.
		$diff = array_diff(getArtistsArray(), array_keys($contentArray), [".", ".."]);
		
		if(!empty($diff)){
			// If one artist added or more.
			
			foreach($diff as $artist){
				// Browse of the added artists and parameters added to json content.
				$contentArray[$artist] = "";
			}
			
			// Sort of the keys of the json file
			ksort($contentArray);
			
			// Content added to json file.
			$fp = fopen($path, "w");
			
			// Pointer at the beginning of the file.
			fseek($fp, 0);
			
			// Writing of the content in json file.
			fwrite($fp, json_encode($contentArray));
			
			// Closing the json file.
			fclose($fp);
			
			// Changed happened and everything went well.
			return true;
			
			// Changed happened and everything went well.
			return true;
		}else{
			// No changes happened.
			return false;
		}
	}catch(Exception $e){
		// Exception thrown, no change
		return false;
	}
}

/**
 * Method to generate the Token json file
 */
function generateToken(){
	// Initialization of json file.
	$file = "nsfw.json";
	
	// Search if twitter.json exists.
	$path = "../".$file;
	
	try{
		// Find all files in parent directory of current directory.
		$files = scandir("..");
		
		// Search if nsfw.json exists.
		$key = array_search($file, $files);
		
		// Initialization of parameters for encryption.
		$pass           = 'FhuraiIsDoneWithThisShit';
		$method         = 'aes-128-cbc';
		$initVector     = "0123456789012345";
		
		// Encrypt of the artists name as a token
		$encrypted      = urlencode(openssl_encrypt(json_encode(getArtistsArray()), $method, $pass, false, $initVector));
		
		// Content added to json file.
		$fp = fopen($path, "w");
		
		// Pointer at the beginning of the file.
		fseek($fp, 0);
		
		// Writing of the content in json file.
		fwrite($fp, $encrypted);
		
		// Closing the json file.
		fclose($fp);
		
		// Changed happened and everything went well.
		return true;
	}catch(Exception $e){
		// Exception thrown, no change
		return false;
	}
}

/**
 * Method to get all artists from repository.
 */
function getArtistsArray(){
	// Return all folders names in repository
	return scandir("../../Commissions/");
}

/**
 * Method to generate the admin password json file
 */
function generateAdmin($password){
	// Initialization of json file.
	$file = "admin.json";
	
	// Search if twitter.json exists.
	$path = "../".$file;
	
	try{
		// Find all files in parent directory of current directory.
		$files = scandir("..");
		
		// Search if nsfw.json exists.
		$key = array_search($file, $files);
		
		// Initialization of parameters for encryption.
		$pass           = 'FhuraiIsDoneWithThisShit';
		$method         = 'aes-128-cbc';
		$initVector     = "0123456789012345";
		
		// Encrypt of the artists name as a token
		$encrypted      = urlencode(openssl_encrypt($password, $method, $pass, false, $initVector));
		
		// Content added to json file.
		$fp = fopen($path, "w");
		
		// Pointer at the beginning of the file.
		fseek($fp, 0);
		
		// Writing of the content in json file.
		fwrite($fp, substr($encrypted, 0, 100));
		
		// Closing the json file.
		fclose($fp);
		
		// Changed happened and everything went well.
		return true;
	}catch(Exception $e){
		// Exception thrown, no change
		return false;
	}
}