<?php
// Class Thumbimage
class ThumbImage
{
	// Picture source for thumbnail.
    private $source;
 
	// Constructor.
    public function __construct($sourceImagePath)
    {
        $this->source = $sourceImagePath;
    }
	
	// Method to get the picture source for thumbnail.
	public function getSource(){
		return $this->source;
	}
 
	// Method to create the picture thumbnail.
    public function createThumb($destImagePath, $thumbWidth=100)
    {		
		try{
			$thumb = new Imagick($this->source);
			$thumb->resizeImage($thumbWidth, $thumbHeight, Imagick::FILTER_LANCZOS,1);
			$thumb->writeImage($destImagePath);
		}catch(Exception $e){
			
		}
    }
}