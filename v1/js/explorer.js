var token = "";

// Page content loaded event.
document.addEventListener("DOMContentLoaded", function(){
	// Récupération token pour nsfw.
	token = location.search.substr(1);
	
	getTitle();
	getArtistesFolders();
	closeModal();
	clearModal();
});