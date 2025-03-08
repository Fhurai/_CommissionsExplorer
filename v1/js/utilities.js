// Method to add spinner to HTML element.
function showSpinner(element){
	element.innerHTML = "<div id='spinner'></div>";
}

// Method to delete a spinner in a HTML Element by a string.
function hideSpinnerText(element, string){
	element.innerText = string;
}