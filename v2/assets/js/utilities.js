/**
 * Reloads the current page.
 */
function reloadPage(){
  location.reload();
}

/**
 * Capitalizes the first letter of a string and converts the rest to lowercase.
 *
 * @param {string} string - The input string to transform.
 * @returns {string} The transformed string with the first letter capitalized.
 *
 * @example
 * ucFirst('hello');    // Returns 'Hello'
 * ucFirst('HELLO');    // Returns 'Hello'
 * ucFirst('');         // Returns ''
 *
 * @note Handles empty strings gracefully.
 * @warning Does not check input type (expects string).
 */
function ucFirst(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * Dynamically sets the document title based on URL query parameters.
 *
 * - Uses the "artist" query parameter if present (capitalized via ucFirst()).
 * - Defaults to "Welcome | ComEx" when no artist parameter exists.
 * - Updates document.title directly.
 *
 * @function setPageTitle
 * @example
 * // For URL: https://example.com/?artist=picasso
 * // Sets document.title to "Picasso | ComEx"
 */
function setPageTitle() {
  const searchParams = new URLSearchParams(window.location.search);
  const artist = searchParams.get("artist");
  document.title = artist ? `${ucFirst(artist)} | ComEx` : "Welcome | ComEx";
}

/**
 * Checks if the current page is the welcome page.
 *
 * @returns {boolean} True if the current page is the welcome page, false otherwise.
 */
function isWelcomePage() {
  return document.title === "Welcome | ComEx";
}

/**
 * Sets the NSFW (Not Safe For Work) flag based on URL query parameters.
 */
function setIsNsfw() {
  const searchParams = new URLSearchParams(window.location.search);
  isNsfw = isWelcomePage() && searchParams.get("isNsfw") === "true";
}

/**
 * Empties the suggestions list and hides related UI elements.
 */
function emptySuggestions() {
  const suggestions = document.querySelector("#suggestions");
  suggestions.innerHTML = "";
  suggestions.classList.remove("show");
  document.querySelector("#backdrop").classList = "";
  document.querySelector("#results").innerText = "";
}

/**
 * Handles keyboard navigation within the suggestions list.
 *
 * @param {KeyboardEvent} event - The keyboard event.
 * @returns {boolean} True if navigation occurred, false otherwise.
 */
function navigateSuggestions(event) {
  const suggestionsList = document.getElementById("suggestions");
  const items = suggestionsList.querySelectorAll("li");
  if (!items.length) return false;

  const currentSelected = suggestionsList.querySelector(".selected");
  let index = Array.from(items).indexOf(currentSelected);

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      index = (index + 1) % items.length;
      break;
    case "ArrowUp":
      event.preventDefault();
      index = (index - 1 + items.length) % items.length;
      break;
    case "Enter":
      if (currentSelected) accessSuggestion(currentSelected.innerText);
      return true;
    default:
      return false;
  }

  items.forEach(item => item.classList.remove("selected"));
  items[index].classList.add("selected");
  setTimeout(() => items[index].scrollIntoView({ behavior: "smooth", block: "nearest" }), 10);
  return true;
}

/**
 * Transmits a click event to access a suggestion.
 *
 * @param {MouseEvent} event - The mouse event.
 */
function transmitClick(event) {
  accessSuggestion(event.currentTarget.innerText);
}

/**
 * Accesses a suggestion by setting the search field value and showing the unique suggestion.
 *
 * @param {string} artistName - The name of the artist to access.
 */
function accessSuggestion(artistName) {
  const searchField = document.querySelector("#search");
  searchField.value = artistName;
  showUniqueSuggestion();
  searchField.value = "";
}

// *** Load functions

/**
 * Loads the content of the page based on the current state.
 */
function loadContent() {
  const gallery = document.querySelector("#gallery");
  const isWelcome = isWelcomePage();
  gallery.innerHTML = isWelcome ? "<span class='push'></span>" : "";
  gallery.style.marginTop = isWelcome ? "" : "unset";
  showReturnButton(!isWelcome);

  if (isWelcome) {
    loadArtists();
  } else {
    loadArtworks();
  }
  showNavBar();
}

/**
 * Loads the list of artists from the server.
 */
function loadArtists() {
  setIsNsfw();
  const spinner = document.querySelector("#spinner");
  spinner.classList.add("loading");

  fetch(`${host}artists.php?isNsfw=${isNsfw}`)
    .then(res => res.json())
    .then(artists => {
      const spinnerNumber = document.querySelector("#spinnerNumber");
      const artistKeys = Object.keys(artists);
      spinnerNumber.innerText = `0 / ${artistKeys.length}`;

      artistKeys.forEach((artistName, idx) => {
        spinnerNumber.innerText = `${idx + 1} / ${artistKeys.length}`;
        const card = generateCard(artistName, artists[artistName]);
        addClick(card, goToArtist);
      });
    })
    .catch(err => console.error("Failed to update artist list:", err.message))
    .finally(() => {
      spinner.classList.remove("loading");
      document.querySelector("#spinnerNumber").innerText = "";
      addInput(document.querySelector("#search"), showSuggestions);

      if (document.querySelector("#search").value) {
        setTimeout(showUniqueSuggestion, 500);
      }
    });
}

/**
 * Loads the list of artworks for the specified artist from the server.
 */
async function loadArtworks() {
  const searchParams = new URLSearchParams(window.location.search);
  const artist = searchParams.get("artist");

  try {
    const response = await fetch(`${host}artworks.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ artist }),
    });
    const artworks = await response.json();
    const processedArtworks = artworks.map(artwork => artwork.split("/").slice(1).join("/"));
    await progress("thumbnails", artist);
    setTimeout(() => setThumbnails(artist, processedArtworks), 250);
  } catch (err) {
    console.error("Failed to update artworks list:", err.message);
  } finally {
    document.querySelector("#spinnerNumber").innerHTML = "";
  }
}

/**
 * Updates the progress of an ongoing action for a specific artist.
 *
 * @param {string} action - The action being performed (e.g., "thumbnails").
 * @param {string} artist - The name of the artist.
 */
async function progress(action, artist) {
  const spinner = document.querySelector("#spinner");
  const spinnerNumber = document.querySelector("#spinnerNumber");
  const progressMore = document.querySelector("#progressMore");

  if (!spinner.classList.contains("loading")) {
    spinner.classList.add("loading");
  }

  try {
    const response = await fetch(`${host}progress.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ action, artist }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const progressValue = await response.json();
    const percentage = Math.round(progressValue * 10000) / 100;
    const currentPercentage = parseFloat(spinnerNumber.textContent);

    if (currentPercentage === percentage) {
      progressMore.textContent = progressMore.textContent.length === 23 ? "." : progressMore.textContent + ".";
    } else {
      spinnerNumber.textContent = `${percentage}%`;
      progressMore.textContent = "";
    }

    console.info(`${artist}: ${percentage}%`);
  } catch (err) {
    console.error("Progress update failed:", err.message);
    spinner.classList.remove("loading");
  }
}

/**
 * Sets the thumbnails for the specified artist's artworks.
 *
 * @param {string} artist - The name of the artist.
 * @param {Array<string>} artworks - The list of artworks.
 */
async function setThumbnails(artist, artworks) {
  const spinner = document.querySelector("#spinner");
  const spinnerNumber = document.querySelector("#spinnerNumber");

  spinnerNumber.textContent = "0%";
  spinner.classList.add("loading");
  console.info(`${artist}: 0% - Start`);

  try {
    for (const artwork of artworks) {
      const response = await fetch(`${host}thumbnail.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworks: [artwork] }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await progress("thumbnails", artist);
    }

    artworks.forEach(artwork => generatePreview(`../${artwork}`));
    console.info(`${artist}: 100% - End`);
    spinnerNumber.textContent = "100%";
  } catch (error) {
    console.error("Gallery load failed:", error.message);
  } finally {
    spinner.classList.remove("loading");
  }
}

/**
 * Checks for new artists on the server.
 */
function checkNew() {
  const spinner = document.querySelector("#spinner");
  spinner.classList.add("loading");

  fetch(`${host}new.php`)
    .then(res => res.json())
    .then(artists => {
      if (artists.length > 0) console.info(artists);
    })
    .catch(err => console.log("Failed to check new artists:", err.message))
    .finally(() => {
      spinner.classList.remove("loading");
    });
}

// *** Show/Hide functions

/**
 * Reloads the filter buttons based on the current NSFW state.
 *
 * @param {HTMLElement} root - The root element containing the filter buttons.
 */
function reloadFiltersButtons(root) {
  root.querySelector(`input[type='radio'][value='${isNsfw}']`).defaultChecked = true;
  root.querySelectorAll("span > label").forEach(btn => addClick(btn, changeFilter));
}

/**
 * Shows or hides the return button based on the specified flag.
 *
 * @param {boolean} showReturnButton - Whether to show the return button.
 */
function showReturnButton(showReturnButton) {
  const returnBtn = document.getElementById("returnBtn");
  if (showReturnButton) {
    returnBtn.removeAttribute("hidden");
    addClick(returnBtn, returnIndex);
  } else {
    returnBtn.setAttribute("hidden", "hidden");
  }
}

/**
 * Shows or hides the navigation bar based on the current page state.
 */
function showNavBar() {
  const nav = document.querySelector("nav");
  if (isWelcomePage()) {
    nav.removeAttribute("hidden");
  } else {
    nav.setAttribute("hidden", "hidden");
  }
}

/**
 * Shows suggestions based on the current search input value.
 *
 * @param {Event} event - The input event.
 */
function showSuggestions(event) {
  emptySuggestions();
  const search = event.currentTarget.value.toLowerCase();
  const cards = document.querySelectorAll(".card");

  if (search && cards.length > 1) {
    cards.forEach((card, idx) => {
      const cardName = card.id.trim().toLowerCase();
      const included = cardName.startsWith(search);

      card.dataset.hidden = !included;
      card.classList.remove("searched");

      if (included) {
        const li = document.createElement("li");
        li.innerHTML = cardName;
        li.dataset.card = `#${cardName}`;
        li.dataset.pos = idx;
        document.querySelector("#suggestions").appendChild(li);
        addClick(li, transmitClick);
      }
    });

    document.querySelector("#backdrop").classList = "show";
    document.querySelector("#results").innerText = `${document.querySelector("#suggestions").childElementCount} / ${cards.length}`;
    addKeyDown(event.currentTarget, navigateSuggestions);
  }
}

/**
 * Shows the unique suggestion based on the current search input value.
 */
function showUniqueSuggestion() {
  const searchTerm = document.querySelector("#search").value.trim().toLowerCase();
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    if (card.id.toLowerCase() === searchTerm) {
      card.classList.add("searched");
      setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), 10);
      emptySuggestions();
    } else {
      card.dataset.hidden = true;
    }
  });
}

// *** Move functions

/**
 * Changes the filter based on the clicked button.
 *
 * @param {Event} event - The click event.
 */
function changeFilter(event) {
  const newNsfwState = event.currentTarget.innerText === "NSFW";
  if (isNsfw !== newNsfwState) {
    const state = { data: "optional state object" };
    const title = `Welcome ${isNsfw} | ComEx`;
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("isNsfw", newNsfwState);

    const newUrl = `/Commissions/v2/${page}?${searchParams.toString()}`;
    history.pushState(state, title, newUrl);
    document.querySelector("#search").value = "";
  }
}

/**
 * Navigates to the artist page based on the clicked element.
 *
 * @param {Event} event - The click event.
 */
function goToArtist(event) {
  const state = { data: "optional state object" };
  const title = `${event.currentTarget.id} | ComEx`;
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set("artist", event.currentTarget.id);

  const newUrl = `/Commissions/v2/${page}?${searchParams.toString()}`;
  history.pushState(state, title, newUrl);
  setPageTitle();
}

/**
 * Returns to the index page from the artist page.
 */
function returnIndex() {
  const artist = document.title.split("|")[0].trim();
  const state = { data: "optional state object" };
  const title = "Welcome | ComEx";
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.delete("artist");

  const newUrl = `/Commissions/v2/${page}?${searchParams.toString()}`;
  history.pushState(state, title, newUrl);
  setPageTitle();
  document.querySelector("#search").value = artist;
}
