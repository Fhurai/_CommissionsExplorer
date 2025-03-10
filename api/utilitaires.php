<?php

require_once "./thumbimage.class.php";

$toIgnore = [];

function getQueryParameter(string $arg): string | bool {
    if(isset($_GET) && array_key_exists($arg, $_GET)){
        return $_GET[$arg];
    }
    return false;
}

function getFormParameter(string $arg): mixed {
    if(isset($_POST) && array_key_exists($arg, $_POST)){
        return $_POST[$arg];
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if($data !== null && array_key_exists($arg, $data)){
        return $data[$arg];
    }

    return false;
}

function explorePath(string $path): array{
    $explored = [];
    $files = array_filter(scandir($path), function($file){
        return $file !== "." && $file !== "..";
    });

    // Files to remove.
    $toRemove = ["desktop.ini", "Thumbs.db", "@eaDir"];

    $toIgnore = [
        'ini', 'db', 'db@SynoEAStream', 
        'png@SynoEAStream', 'psd@SynoEAStream',
        'txt@SynoEAStream',

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

    foreach($files as $key => $file){
        
        if(in_array($file, $toRemove)){
            if(is_dir($path."/".$file)){
                system('rm -rf -- ' . escapeshellarg($path."/".$file), $retval);
            }else{
                unlink($path."/".$file);
            }
        }else{
            $extension = pathinfo($file, PATHINFO_EXTENSION);

            if(!empty($extension)){
                if(!in_array($extension, $toIgnore)){
                    $explored[] = $path . "/" . $file;
                }
            }else{
                unset($files[$key]);
                $explored = array_merge($explored, explorePath($path . "/" . $file));
            }
        }
    }
    
    return $explored;
}

function getFullPaths(string $artwork): array{
    ini_set('display_errors',0);
    ini_set('log_errors',1);
    ini_set('error_log','/path/to/custom.log');

    $host = "http://naslku.synology.me/Commissions/";
    $commPath = $artwork;
    $thumbPath = str_replace("commissions/", "thumbs/", $artwork);

    if(!file_exists("../".$commPath)){
        throw new Exception("Artwork link not found:".$commPath);
    }
    
    $dirPath = "";
    $words = explode("/", "../".$thumbPath);
    foreach($words as $key => $word){
    	$dirPath .= $word . ($key < count($words) -1 ? "/" : "");
    	if(!is_dir($temp) && $key < count($words) -1){
    		mkdir($dirPath, 0755, false);
    	};
    }

    if(!file_exists("../".$thumbPath)){
        $temp = explode("/", $thumbPath);
        unset($temp[count($temp) - 1]);
        $temp = "../".implode("/", $temp);
        if(!is_dir($temp)) mkdir($temp, 0777, false);

        $objThumbImage = new ThumbImage("../".$commPath);
		$objThumbImage->createThumb("../".$thumbPath, 250);
    }

    return [$host.$commPath, $host.$thumbPath];
}