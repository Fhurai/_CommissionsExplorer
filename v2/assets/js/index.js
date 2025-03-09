const host = "http://naslku.synology.me/Commissions/api/";
var isNsfw;

// *****************************************
// *** Events

document.addEventListener("DOMContentLoaded", function(){

    const paramsString = window.location.search;
    const searchParams = new URLSearchParams(paramsString);
    isNsfw = searchParams.get("isNsfw") === "true";

    showButtons(searchParams.get("isNsfw") !== null);
    loadArtists();

    clickContentFilter();
    InputSearchField();
});

function clickContentFilter(){

    Array.from(document.querySelectorAll("nav span label")).forEach((btn) => {

        btn.addEventListener("click", function(e){
            if(isNsfw !== (e.currentTarget.innerText === "NSFW")){
                isNsfw = e.currentTarget.innerText === "NSFW";
                loadArtists();
                document.querySelector("#search").value = "";
            }
        });

    });
}

function InputSearchField(){
    document.querySelector("#search").addEventListener("input", function(e){
        searchWithSuggestion(e.currentTarget.value);
    });
}

function clickSuggestion(){

    document.querySelectorAll("nav span ul li").forEach((btn) => {

        btn.addEventListener("click", function(e){
            document.querySelector("#search").value = e.currentTarget.innerText;
            emptySuggestions();
            showUniqueSuggestion();
            document.querySelector("#search").value = "";
        });
    });
}

// *****************************************
// *** Buttons show

function showButtons(showButtons){

    if(showButtons){
        document.querySelector("nav").removeAttribute("hidden");
        document.querySelector(`input[type='radio'][value='${isNsfw}']`).defaultChecked = true;
    }else{
        document.querySelector("nav").setAttribute("hidden", "hidden");
        document.querySelector("#gallery").style.marginTop = "0rem";
    }
}

// *****************************************
// *** Artists load

function loadArtists(){
    if(!document.querySelector("nav").hasAttribute("hidden")) document.querySelector("#gallery").innerHTML = "<span class='push'></span>";

    document.querySelector("#spinner").classList.add("loading");

    fetch(`http://naslku.synology.me/Commissions/api/artists.php?isNsfw=${isNsfw}`)
        .then(res => res.json())
        .then(artists => {
            // Populate artist selection dropdown
            Object.keys(artists).forEach((artistName, idx) => {
                createCard(artistName, Object.values(artists)[idx]);
            });
            document.querySelector("#spinner").classList.remove("loading");
        })
        .catch(err => {
            console.error("Failed to update artist list:", err.message);
        })

}

function createCard(artistName, thumb){
    const img = document.createElement("img");
    img.src = thumb;
    img.alt = `picture by ${artistName}`;
    if(thumb === "./assets/img/folder.png"){
        img.style.width = "200px";
    }

    const container = document.createElement("div");
    container.className = "img-div";
    container.appendChild(img);

    const div = document.createElement("div");
    div.className = "card";
    div.id = artistName;
    div.appendChild(container);

    document.querySelector("#gallery").appendChild(div);

    img.onload = function(){
        console.log(img.naturalHeight+" : "+img.alt);

        if(img.naturalHeight < 250){
            img.style.width = "unset";
            img.style.height = "100%";

            container.style.display = "flex";
            container.style.justifyContent = "center";
        }
    }
}

// *****************************************
// *** Search

function searchWithSuggestion(search){
    emptySuggestions();

    if(search !== "" && document.querySelectorAll(".card").length > 1){
        Array.from(document.querySelectorAll(".card")).forEach((card) => {

            const search = document.querySelector("#search").value.trim();
            const cardName = card.id.trim();
            
            let included = (cardName.substring(0, search.length).toLowerCase().includes(search.toLowerCase()));
            card.dataset.hidden = !included;
            card.classList.remove("searched");
    
            if(included){
                const li = document.createElement("li");
                li.innerHTML = card.id.trim();
                li.dataset.card = "#"+card.id.trim();
    
                document.querySelector("#suggestions").appendChild(li);
            }
        });

        if(!document.querySelector("#suggestions").classList.contains("show")){
            document.querySelector("#suggestions").classList.add("show");
            document.querySelector("#backdrop").classList = "show";
        }
        clickSuggestion();

        if(document.querySelectorAll("#suggestions li").length == 1){
            document.querySelector("#search").disabled = true;
            emptySuggestions();
            showUniqueSuggestion();
            document.querySelector("#search").value = "";
            document.querySelector("#search").disabled = false
        }
    }
}

function emptySuggestions(){
    document.querySelector("#suggestions").innerHTML = "";
    document.querySelector("#suggestions").classList.remove("show");
    document.querySelector("#backdrop").classList = "";
}

function showUniqueSuggestion(){
    Array.from(document.querySelectorAll(".card")).forEach((card) => {
        
        const search = document.querySelector("#search").value.trim();
        const cardName = card.id.trim();

        if(cardName.substring(0, search.length).toLowerCase().includes(search.toLowerCase())){
            card.classList.add("searched");
            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest'})
            }, 10);
        }
    });
}