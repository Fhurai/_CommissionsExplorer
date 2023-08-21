// Artworks
function clickArtistArtworks(){
	document.querySelectorAll("div#explorer > div").forEach((container) => {
		container.addEventListener("click", function(event){
			let artistName = event.currentTarget.querySelector(".name").innerHTML;
			document.getElementById("menu").innerHTML = "";
			
			if(Object.keys(event.currentTarget.dataset).length > 0){
				let button = getTwitterButton(event.currentTarget.dataset.twitter);
				document.getElementById("menu").appendChild(button);
			}
			
			getArtistArtworks(artistName);
		});
	});
}

async function getArtistArtworks(artist){
	// Load icon show.
	showSpinner(document.getElementById("explorer"));
	
	// Promise to read all available artists folders.
	await fetch("php/webservices/artistDetails.php", {
				  method: 'POST',
				  headers: {
					'Content-Type': 'application/json',
				  },
				  body: JSON.stringify({"artist": artist}),
				})
		.then(response => response.json())
		.then(data => {
			
			hideSpinnerText(document.getElementById("explorer"), "");

			document.getElementById("explorer").appendChild(getArtistTitle(artist));
			
			document.getElementById("menu").appendChild(getHomeButton(artist));
			
			Object.entries(data).forEach((artwork) => {				
				let container = getContainer(artwork, true);
				container.setAttribute("for", "art"+artwork[0]);
				
				addToCarousel(artwork);
				
				container.addEventListener("click", function(){
					document.getElementById("modal-2").checked = true;
					document.querySelector("#art"+artwork[0]).classList.add("show");
				});				
				
				document.getElementById("explorer").appendChild(container);				
			});
		})
		.catch(function(err){
			console.log(err);
			hideSpinnerText(document.getElementById("explorer"), err);
		});
}

function getContainer(artwork, isPreview){
	let container = document.createElement("div");
	
	if(isPreview){
		let picture = document.createElement("div");
		let img = document.createElement("img");
		
		picture.classList = "preview";
		img.loading = "lazy";
		
		if(["wav", "WAV", "mp3", "MP3"].includes(artwork[1].split('.').pop())){
			img.src = "icons/music.png";
		}else if(["mp4", "MP4", "mov", "MOV"].includes(artwork[1].split('.').pop())){
			img.src = "icons/film.png";
		}else if(["txt", "TXT"].includes(artwork[1].split('.').pop())){
			img.src = "icons/file.png";
		}else{
			img.src = artwork[1].replace("../Commissions/", "Commissions/thumbs/");
		}
		
		picture.appendChild(img);
		container.appendChild(picture);
	}else{
		container.classList = "original";
	}
	
	let nameDiv = document.createElement("div");
	let urlArray = artwork[1].split("/");
	nameDiv.innerHTML = "<label>"+urlArray[urlArray.length - 1]+"</label>";
	nameDiv.classList = "name ";
	container.appendChild(nameDiv);
	
	return container;
}

function getHomeButton(artist){
	let button = document.createElement("div");
	button.classList = "home";
	button.innerText = "Home";
	
	button.addEventListener("click", function(){
		document.getElementById("menu").innerHTML = "";
		getArtistesFolders();
		if(artist !== null){
			setTimeout(() => {
				document.querySelector("#menu input").value = artist;
				document.querySelector("#menu input").dispatchEvent(new Event('input', {bubbles:true}));
				document.querySelector("#menu input").value = "";
				document.querySelector("#menu label").innerHTML = "";
				document.querySelectorAll("#explorer div.name").forEach((name) => {
					name.parentElement.classList = "";
				});
				document.getElementById("title").classList.remove("hidden");
			}, 1000);
		}
		document.querySelector(".carousel").innerHTML = "";
	});
	
	return button
}

function getTwitterButton(twitter){
	let link = document.createElement("a");
	link.href = twitter;
	link.target = "_blank";
	
	let button = document.createElement("div");
	button.classList = "twitter";
	button.innerText = "@"+twitter.split('/').pop();
	link.appendChild(button);
	return link;
}

function getArtistTitle(artistName){
	let title = document.createElement("h3");
	title.innerText = artistName;
	
	return title;
}
