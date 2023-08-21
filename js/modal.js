// Modal
function closeModal(){
	document.querySelectorAll(".modal-close").forEach((button) => {
		button.addEventListener("click", function(){
			document.querySelector(".modal-state").removeAttribute("checked");
		});
	});
}

function clearModal(){
	document.querySelector("#modal-2").addEventListener("change", function(){
		document.querySelectorAll(".original").forEach((elt) => {elt.classList.remove("show")});
	});
}

async function addToCarousel(artwork){
	let container = getContainer(artwork, false);
	container.id = "art"+artwork[0];
	
	let extension = artwork[1].split('.').pop();
	
	if(["wav", "WAV", "mp3", "MP3"].includes(extension)){
		// MUSIC
		
		let sound = document.createElement("div");
		sound.classList.add("player");
		
		let audio = document.createElement("audio");
		audio.controls = true;
		audio.preload = "auto";
		audio.setAttribute("src", artwork[1].replace("../Commissions/", "Commissions/Commissions/"));
		audio.controlsList = "nodownload noplaybackrate";
		
		sound.appendChild(audio);
		container.appendChild(sound);
	}else if(["mp4", "MP4", "mov", "MOV"].includes(extension)){
		// VIDEO
		
		let movie = document.createElement("div");
		movie.classList.add("player");
		
		let video = document.createElement("video");
		video.controls = true;
		video.preload = "auto";
		video.setAttribute("src", artwork[1].replace("../Commissions/", "Commissions/Commissions/"));
		video.controlsList = "nodownload noplaybackrate";
		
		movie.appendChild(video);
		container.appendChild(movie);
	}else if(["txt", "TXT"].includes(extension)){
		// TEXT
		
		let story = document.createElement("div");
		story.classList = "reader";
		
		await fetch("php/webservices/serveText.php", {
				  method: 'POST',
				  headers: {
					'Content-Type': 'application/json',
				  },
				  body: JSON.stringify({"link": artwork[1]}),
				})
		.then(response => response.json())
		.then(data => {			
			
			let chapters = data["text"].split("<br />\r\n————————<br />\r\n————————");
			
			chapters.forEach((chapter, count) => {
				let fiction = document.createElement("div");
				fiction.innerHTML = chapter;
				if(chapters.length !== count){
					if(count !== 0) story.appendChild(document.createElement("hr"));
					let chapterTitle = document.createElement("h4");
					chapterTitle.innerText = "Chapter "+(count+1);
					story.appendChild(chapterTitle);
				};
				story.appendChild(fiction);
			});
		})
		.catch(function(err){
			console.log(err);
		});
		container.appendChild(story);
	}else{
		// PICTURE
		
		let img = document.createElement("img");
		let picture = document.createElement("div");
		
		nextArtwork(img);
		
		img.src = artwork[1].replace("../Commissions/", "Commissions/Commissions/");
		img.loading = "lazy";
		
		picture.appendChild(img);
		container.appendChild(picture);
	}
	
	
	let commands = document.createElement("div");
	commands.classList = "commands";
	
	let original = document.createElement("a");
	original.innerText = "Go to original";
	original.href = artwork[1].replace("../Commissions/", "Commissions/Commissions/");
	original.target = "_blank";
	commands.appendChild(original);
	
	let close = document.createElement("label");
	close.innerText = "close";
	close.classList = "modal-close button";
	commands.appendChild(close);
	close.addEventListener("click", function(){
		document.querySelector(".modal-state").checked = false;
		document.querySelectorAll(".original").forEach((elt) => {elt.classList.remove("show")});
		
	});
	container.appendChild(commands);
	
	document.querySelector(".carousel").appendChild(container);
	
	addNavigationButtons(container.querySelector(".name"));
	addNavigationButtons(commands);
}

function nextArtwork(element){
	element.addEventListener("click", function(){
		let showedContainer = element.parentElement.parentElement;
		if(showedContainer.nextElementSibling !== null){
			showedContainer.classList.remove("show");
			showedContainer.nextElementSibling.classList.add("show");
			document.querySelector(".modal-inner").scrollTop = 0;
		}
	});
}

function previousArtwork(element){
	element.addEventListener("click", function(){
		let showedContainer = element.parentElement.parentElement;
		if(showedContainer.previousElementSibling !== null){
			showedContainer.classList.remove("show");
			showedContainer.previousElementSibling.classList.add("show");
			document.querySelector(".modal-inner").scrollTop = 0;
		}
	});
}

function firstArtwork(element){
	element.addEventListener("click", function(){
		let showedContainer = element.parentElement.parentElement;
		showedContainer.classList.remove("show");
		showedContainer.parentElement.firstElementChild.classList.add("show");
		document.querySelector(".modal-inner").scrollTop = 0;
	});
}

function lastArtwork(element){
	element.addEventListener("click", function(){
		let showedContainer = element.parentElement.parentElement;
		showedContainer.classList.remove("show");
		showedContainer.parentElement.lastElementChild.classList.add("show");
		document.querySelector(".modal-inner").scrollTop = 0;
	});
}

function addNavigationButtons(barElement){
	let selectedElement = barElement.parentElement;
	
	if(selectedElement.parentElement.firstElementChild !== selectedElement){
		let previous = document.createElement("div");
		previous.innerHTML = "<";
		previousArtwork(previous);
		barElement.insertBefore(previous, barElement.firstChild);
		
		let first = document.createElement("div");
		first.innerHTML = "<<";
		firstArtwork(first);
		barElement.insertBefore(first, barElement.firstChild);
	}
	
	if(selectedElement.previousSibling !== null){
		let next = document.createElement("div");
		next.innerHTML = ">";
		nextArtwork(next);
		selectedElement.previousSibling.querySelector("."+Array.from(barElement.classList).join(".")).appendChild(next);
		
		let last = document.createElement("div");
		last.innerHTML = ">>";
		lastArtwork(last);
		selectedElement.previousSibling.querySelector("."+Array.from(barElement.classList).join(".")).appendChild(last);
	}
}