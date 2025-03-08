// Browser
async function getTitle(){
	// Load icon show.
	showSpinner(document.getElementById("title"));
	
	// Promise to read all available artists folders.
	await fetch("php/webservices/getExplorerTitle.php", {
				  method: 'POST',
				  headers: {
					'Content-Type': 'application/json',
				  },
				  body: JSON.stringify({"token": token}),
				})
		.then(response => response.json())
		.then(data => {
			hideSpinnerText(document.getElementById("title"), data.title);
		})
		.catch(function(err){
			hideSpinnerText(document.getElementById("title"), err);
		});
	
}

async function getArtistesFolders(){
	// Load icon show.
	showSpinner(document.getElementById("explorer"));
	
	// Promise to read all available artists folders.
	await fetch("php/webservices/explorer.php", {
				  method: 'POST',
				  headers: {
					'Content-Type': 'application/json',
				  },
				  body: JSON.stringify({"token": token}),
				})
		.then(response => response.json())
		.then(data => {
			
			if(Object.entries(data).length > 0){
				hideSpinnerText(document.getElementById("explorer"), "");
			
				Object.entries(data).forEach((artist) => {
					let container = document.createElement("div");
					if(artist[1].twitter !== "") container.dataset.twitter = artist[1].twitter;
					
					let picture = document.createElement("div");
					let img = document.createElement("img");
					//img.loading = "lazy";
					img.src = artist[1].thumbnail;
					picture.appendChild(img);
					container.appendChild(picture);
					
					let nameDiv = document.createElement("div");
					nameDiv.innerText = artist[0];
					nameDiv.classList = "name " + (artist[1].sfw ? "sfw" : "nsfw");
					container.appendChild(nameDiv);
					document.getElementById("explorer").appendChild(container);
				});
				
				clickArtistArtworks();
				
				document.getElementById("menu").appendChild(getSearchBar());
			}else{
				hideSpinnerText(document.getElementById("explorer"), "No "+(document.getElementById("title") === "Fhurai's Commissions, SFW & NSFW" ? "" : "SFW ")+"folder found.");
			}
		})
		.catch(function(err){
			hideSpinnerText(document.getElementById("explorer"), err);
			fetch("php/webservices/generateJson.php")
			.then(response => response.json())
			.then(data => {
				location.reload();
			});
		});
}

function getSearchBar(){
	let searchBar = document.createElement("div");
	searchBar.classList = "search-bar";
	
	let input = document.createElement("input");
	input.placeholder = "Search the artist here...";
	searchBar.appendChild(input);
	
	let label = document.createElement("label");
	searchBar.appendChild(label);
	
	let autocomplete = document.createElement("div");
	autocomplete.classList = "autocomplete hidden";
	autocomplete.innerText = "Test";
	searchBar.appendChild(autocomplete);


	input.addEventListener("input", function(event){
		autocomplete.classList.add("hidden");
		autocomplete.innerHTML = "";
		let searchedArtist = event.currentTarget.value;
		if(searchedArtist.length > 1){
			document.getElementById("title").classList.add("hidden");
			let proposals = [];
			document.querySelectorAll("#explorer div.name").forEach((name) => {
				// Approximative
				if(name.innerText.toLowerCase().includes(searchedArtist.toLowerCase())){
					proposals.push(name.parentElement);
				}
			});
			
			if(proposals.length === 1){
				document.scrollTop = 0;
				proposals[0].classList = "searched";
				setTimeout(() => {
					proposals[0].scrollIntoView({ behavior: 'smooth', block: 'start'})
				}, 10);
			}else if(proposals.length > 1){
				autocomplete.classList.remove("hidden");
				proposals.forEach((name) => { 
					let proposal = document.createElement("div");
					proposal.innerText = name.innerText;
					proposal.addEventListener("click", function(){
						input.value = proposal.innerText;
						document.querySelector("#menu input").dispatchEvent(new Event('input', {bubbles:true}));
						document.getElementById("title").classList.remove("hidden");
					});					
					autocomplete.appendChild(proposal);
				});
				
			}
			
			label.innerText = proposals.length+" result"+(proposals.length > 1 ? "s": "")+" found";
		}else{
			document.getElementById("title").classList.remove("hidden");
			document.querySelectorAll("#explorer div.name").forEach((name) => {
				name.parentElement.classList = "";
			});
		}
	});
	
	return searchBar;
}
