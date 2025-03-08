document.addEventListener("DOMContentLoaded", function(){
	connectForm();
	connectSubmit();
	
	showAdminPanel();
	refreshConfigFiles();
});

function connectForm(){
	let form = document.createElement("div");
	form.classList = "form";
	
	let labelPassword = document.createElement("div");
	labelPassword.innerHTML = "Password : ";
	let inputPassword = document.createElement("input");
	inputPassword.type = "password";
	labelPassword.appendChild(inputPassword);
	form.appendChild(labelPassword);
	
	let button = document.createElement("button");
	button.innerText = "Submit";
	form.appendChild(button);
	
	document.querySelector("#stats").appendChild(form);
}

function connectSubmit(){
	document.querySelector(".form button").addEventListener("click", function(){	
		fetch("php/webservices/password.php", {
			  method: 'POST',
			  headers: {
				'Content-Type': 'application/json',
			  },
			  body: JSON.stringify({"password": document.querySelector(".form input").value}),
			})
		.then(response => response.json())
		.then(data => {
			document.querySelector("input[name='admin']").value = data["admin"];
			if(data["admin"]) document.querySelector("input[name='admin']").dispatchEvent(new Event('change', {bubbles:true}));
		})
		.catch(function(err){
			console.log(err);
		});
	});
}

function showAdminPanel(){
	document.querySelector("input[name='admin']").addEventListener("change", function(event){
		if(event.currentTarget.value === "true"){
			stats();
			menu();
		}
	});
}

function stats(){
	document.querySelector("#stats").innerHTML = "<div id='spinner'></div>";
	fetch("php/webservices/stats.php")
		.then(response => response.json())
		.then(data => {
			document.querySelector("#stats").innerHTML = "";
			
			let title = document.createElement("div");
			title.innerText = "Statistiques";
			title.classList = "title";
			document.querySelector("#stats").appendChild(title);
			
			let containers = document.createElement("div");
			containers.classList = "containers";
			document.querySelector("#stats").appendChild(containers);
			
			let generalContainer = document.createElement("div");
			generalContainer.innerHTML = "<h4>General</h4><label>Artists : "+data["repository"]["artists_total"]+"</label><label>Commissions : "+data["repository"]["artworks"]+"</label>";
			containers.appendChild(generalContainer);
			
			let sfwContainer = document.createElement("div");
			sfwContainer.innerHTML = "<h4>SFW</h4><label>Artists : "+data["json"]["sfw_artists"]+"</label><label>Commissions : "+data["json"]["sfw_artworks"]+"</label>";
			containers.appendChild(sfwContainer);
			
			let nsfwContainer = document.createElement("div");
			nsfwContainer.innerHTML = "<h4>NSFW</h4><label>Artists : "+data["json"]["nsfw_artists"]+"</label><label>Commissions : "+data["json"]["nsfw_artworks"]+"</label>";
			containers.appendChild(nsfwContainer);
			
			let twitterContainer = document.createElement("div");
			twitterContainer.innerHTML = "<h4>Twitter</h4><label>Artists w Twitter : "+data["json"]["twitter"]+"</label><label>Artists w/o Twitter : "+data["json"]["no_twitter"]+"</label>";
			containers.appendChild(twitterContainer);
			
			if(data["json"]["nsfw_artists"] + data["json"]["sfw_artists"] !== data["repository"]["artists_total"]){
				document.querySelector("#alert").classList.remove("hidden");
			}
		})
		.catch(function(err){
			console.log(err);
		});
}

function showSfwModal(){
	document.querySelector("#btn-sfw").addEventListener("click", function(){
		document.getElementById("modal-sfw").checked = true;
	});
}

function showTwitterModal(){
	document.querySelector("#btn-twitter").addEventListener("click", function(){
		document.getElementById("modal-twitter").checked = true;
	});
}

function menu(){
	document.querySelector("#menu").classList.remove("hidden");
	showSfwModal();
	showTwitterModal();
	
	fetch("php/webservices/adminMenu.php")
		.then(response => response.json())
		.then(data => {
			
			//SFW part
			document.querySelector("#modal-sfw-content").innerHTML = "<h3 class='title'>SFW ?</div>";
			Object.entries(data["sfw"]).forEach((sfw) => {
				let label = document.createElement("label");
				label.innerHTML = "<div>"+sfw[0]+"</div><div class='switch'><input type='checkbox'><span class='slider round'></span></div>";
				
				label.querySelector("input").checked = sfw[1];
				
				document.querySelector("#modal-sfw-content").appendChild(label);
			});
			
			let divButtons = document.createElement("div");
			divButtons.classList = "barButtons";
			divButtons.innerHTML = "<button class='validate'>Valider</button><button class='close'>Fermer</button>";
			document.querySelector("#modal-sfw-content").parentElement.appendChild(divButtons);
			
			divButtons.querySelector(".close").addEventListener("click", function(){
				document.getElementById("modal-sfw").checked = false;
			});
			
			divButtons.querySelector(".validate").addEventListener("click", function(){
				saveSfw();
			});
			
			
			// Twitter part
			document.querySelector("#modal-twitter-content").innerHTML = "<h3 class='title'>Twitter ?</div>";
			Object.entries(data["twitter"]).forEach((twitter) => {
				let label = document.createElement("label");
				label.innerHTML = "<div>"+twitter[0]+"</div><div class='label"+(twitter[1] !== "" ? " filled" : "")+"'><input type='text' placeholder='twitter account here...'/></div></div>";
				
				label.querySelector("input").value = twitter[1];
				
				label.querySelector("div.label").addEventListener("input", function(event){
					event.currentTarget.classList = "label";
					if(event.currentTarget.querySelector("input").value !== ""){
						event.currentTarget.classList.add("filled");
					}
				});
				
				document.querySelector("#modal-twitter-content").appendChild(label);
			});
			
			divButtons = document.createElement("div");
			divButtons.classList = "barButtons";
			divButtons.innerHTML = "<button class='validate'>Valider</button><button class='close'>Fermer</button>";
			document.querySelector("#modal-twitter-content").parentElement.appendChild(divButtons);
			
			divButtons.querySelector(".close").addEventListener("click", function(){
				document.getElementById("modal-twitter").checked = false;
			});
			
			divButtons.querySelector(".validate").addEventListener("click", function(){
				saveTwitter();
			});
		})
		.catch(function(err){
			console.log(err);
		});
}

function saveSfw(){
	let arg = new Object();
	document.querySelectorAll("#modal-sfw-content input").forEach((input) => {
		arg[input.parentElement.previousElementSibling.innerHTML] = input.checked;
	});
	arg = JSON.stringify(arg);
	
	fetch("php/webservices/sfw.php", {
			  method: 'POST',
			  headers: {
				'Content-Type': 'application/json',
			  },
			  body: JSON.stringify({"save": arg}),
			})
	.then(response => response.json())
		.then(data => {
			stats();
			document.getElementById("modal-sfw").checked = false;
			location.reload();
		})
		.catch(function(err){
			console.log(err);
		});
}

function saveTwitter(){
	let arg = new Object();
	document.querySelectorAll("#modal-twitter-content input").forEach((input) => {
		arg[input.parentElement.previousElementSibling.innerHTML] = input.value;
	});
	arg = JSON.stringify(arg);
	
	fetch("php/webservices/twitter.php", {
			  method: 'POST',
			  headers: {
				'Content-Type': 'application/json',
			  },
			  body: JSON.stringify({"save": arg}),
			})
	.then(response => response.json())
		.then(data => {
			stats();
			document.getElementById("modal-twitter").checked = false;
			location.reload();
		})
		.catch(function(err){
			console.log(err);
		});
}

function refreshConfigFiles(){
	document.querySelector("#alert button").addEventListener("click", function(){
		fetch("php/webservices/generateJson.php")
		.then(response => response.json())
		.then(data => {
			document.querySelector("#alert").classList.add("hidden");
			stats();
		})
		.catch(function(err){
			console.log(err);
		});
	});
}