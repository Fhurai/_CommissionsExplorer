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
  // Check if the string is empty
  if (string.length === 0) return "";
  // Capitalize the first letter and convert the rest to lowercase
  return string.substring(0, 1).toUpperCase() + string.substring(1).toLowerCase();
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
  let title = "";
  const searchParams = new URLSearchParams(window.location.search);

  // Check if the "artist" query parameter is present
  if (searchParams.get("artist") === null) {
    title = "Welcome | ComEx";
  } else {
    // Capitalize the artist name and set the title
    title = ucFirst(searchParams.get("artist")) + " | ComEx";
  }

  // Update the document title
  document.title = title;
}

/**
 * Checks if the current page is the welcome page.
 *
 * @returns {boolean} True if the current page is the welcome page, false otherwise.
 */
function isWelcomePage() {
  // Compare the document title to the welcome page title
  return document.title === "Welcome | ComEx";
}

/**
 * Sets the NSFW (Not Safe For Work) flag based on URL query parameters.
 */
function setIsNsfw() {
  const searchParams = new URLSearchParams(window.location.search);
  // Set the NSFW flag based on the "isNsfw" query parameter and if it's the welcome page
  isNsfw = isWelcomePage() && searchParams.get("isNsfw") === "true";
}

/**
 * Empties the suggestions list and hides related UI elements.
 */
function emptySuggestions() {
  // Clear the suggestions list
  document.querySelector("#suggestions").innerHTML = "";
  // Hide the suggestions list
  document.querySelector("#suggestions").classList.remove("show");
  // Hide the backdrop
  document.querySelector("#backdrop").classList = "";
  // Clear the results text
  document.querySelector("#results").innerText = "";
}

/**
 * Handles keyboard navigation within the suggestions list.
 *
 * @param {KeyboardEvent} event - The keyboard event.
 * @returns {boolean} True if navigation occurred, false otherwise.
 */
function navigateSuggestions(event) {
  let navigate = true;
  const searchInput = document.getElementById("search");
  const suggestionsList = document.getElementById("suggestions");
  const items = suggestionsList.querySelectorAll("li");

  // Return if there are no items in the suggestions list
  if (!items.length) return;

  // Handle different key events for navigation
  if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
    const currentSelected = suggestionsList.querySelector(".selected");
    let index = Array.from(items).indexOf(currentSelected);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        // Move selection down
        index = index < items.length - 1 ? index + 1 : 0;
        break;
      case "ArrowUp":
        event.preventDefault();
        // Move selection up
        index = index > 0 ? index - 1 : items.length - 1;
        break;
      case "Enter":
        // Access the selected suggestion
        if (currentSelected) {
          accessSuggestion(currentSelected.innerText);
        }
        return;
      default:
        return;
    }

    // Update the selected item
    items.forEach((item) => item.classList.remove("selected"));
    items[index].classList.add("selected");
    setTimeout(() => items[index].scrollIntoView({ behavior: "smooth", block: "nearest" }), 10);
  } else {
    navigate = false;
  }

  return navigate;
}

/**
 * Transmits a click event to access a suggestion.
 *
 * @param {MouseEvent} event - The mouse event.
 */
function transmitClick(event) {
  // Access the suggestion based on the clicked element's text
  accessSuggestion(event.currentTarget.innerText);
}

/**
 * Accesses a suggestion by setting the search field value and showing the unique suggestion.
 *
 * @param {string} artistName - The name of the artist to access.
 */
function accessSuggestion(artistName) {
  const searchField = document.querySelector("#search");
  // Set the search field value to the artist name
  searchField.value = artistName;
  // Show the unique suggestion
  showUniqueSuggestion();
  // Clear the search field value
  searchField.value = "";
}

// *** Load functions

/**
 * Loads the content of the page based on the current state.
 */
function loadContent() {
  const gallery = document.querySelector("#gallery");
  // Set the gallery content based on whether it's the welcome page
  gallery.innerHTML = isWelcomePage() ? "<span class='push'></span>" : "";
  gallery.style.marginTop = isWelcomePage() ? "" : "unset";
  // Show or hide the return button based on the page state
  showReturnButton(!isWelcomePage());

  if (isWelcomePage()) {
    // Load artists if it's the welcome page
    loadArtists();
  } else {
    // Load artworks if it's not the welcome page
    loadArtworks();
  }
  // Show the navigation bar
  showNavBar();
}

/**
 * Loads the list of artists from the server.
 */
function loadArtists() {
  // Set the NSFW flag
  setIsNsfw();

  // Show the loading spinner
  document.querySelector("#spinner").classList.add("loading");
  fetch(`${host}artists.php?isNsfw=${isNsfw}`)
    .then((res) => res.json())
    .then((artists) => {
      // Update the spinner number with the total number of artists
      document.querySelector("#spinnerNumber").innerText = "0 / " + Object.keys(artists).length;
      Object.keys(artists).forEach((artistName, idx) => {
        // Update the spinner number with the current index
        document.querySelector("#spinnerNumber").innerText = idx + " / " + Object.keys(artists).length;
        // Generate a card for each artist
        const card = generateCard(artistName, Object.values(artists)[idx]);
        // Add a click event to the card
        addClick(card, goToArtist);
      });
    })
    .catch((err) => console.error("Failed to update artist list:", err.message))
    .finally(() => {
      // Hide the loading spinner
      document.querySelector("#spinnerNumber").innerText = "";
      document.querySelector("#spinner").classList.remove("loading");

      // Add input event to the search field
      addInput(document.querySelector("#search"), showSuggestions);

      // Show unique suggestion if the search field is not empty
      if (document.querySelector("#search").value !== "") {
        showUniqueSuggestion();
      }
    });
}

/**
 * Loads the list of artworks for the specified artist from the server.
 */
async function loadArtworks() {
  const searchParams = new URLSearchParams(window.location.search);
  const artist = searchParams.get("artist");

  const response = await fetch(`${host}artworks.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ artist: artist }),
  })
    .then((res) => res.json())
    .then((artworks) => {
      // Process the artworks and set the thumbnails
      artworks = artworks.map((artwork) => artwork.split("/").splice(1).join("/"));
      setThumbnails(artist, artworks);
    })
    .catch((err) => console.error("Failed to update artworks list:", err.message))
    .finally(() => {
      // Clear the spinner number
      document.querySelector("#spinnerNumber").innerHTML = "";
    });
}

/**
 * Updates the progress of an action for a specific artist.
 *
 * @param {string} action - The action being performed.
 * @param {string} artist - The artist for whom the action is being performed.
 */
function progress(action, artist) {
  if (!document.querySelector("#spinner").classList.contains("loading")) {
    // Show the loading spinner
    document.querySelector("#spinner").classList.add("loading");
  }

  fetch(`${host}progress.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ action: action, artist: artist }),
  })
    .then((res) => res.json())
    .then((progressValue) => {
      // Calculate the progress percentage
      const percentage = Math.round(progressValue * 10000) / 100;

      // Update the spinner number and progress more text
      if (parseFloat(document.querySelector("#spinnerNumber").innerHTML) === percentage) {
        if (document.querySelector("#progressMore").innerText.length === 23) {
          document.querySelector("#progressMore").innerHTML = "";
        }
        document.querySelector("#progressMore").innerHTML += ".";
      } else {
        document.querySelector("#spinnerNumber").innerText = `${percentage}%`;
        document.querySelector("#progressMore").innerHTML = "";
      }

      console.info(`${artist}: ${percentage}%`);
    })
    .catch((err) => console.error("Failed to update progress:", err.message));
}

/**
 * Sets the thumbnails for the specified artist's artworks.
 *
 * @param {string} artist - The artist whose artworks are being displayed.
 * @param {Array<string>} artworks - The list of artworks.
 */
async function setThumbnails(artist, artworks) {
  // Show the loading spinner and set the initial progress
  document.querySelector("#spinnerNumber").innerText = "0%";
  document.querySelector("#spinner").classList.add("loading");

  console.info(`${artist}: 0% - Start`);
  let timerId = setInterval(() => progress("thumbnails", artist), 1000);

  try {
    const response = await fetch(`${host}thumbnail.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artworks }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status} response`);

    const thumbnails = await response.json();

    // Generate previews for each thumbnail
    Object.values(thumbnails).forEach(([fullSizePath, thumbnailPath]) => {
      generatePreview(fullSizePath);
    });
  } catch (error) {
    console.error("Failed to load gallery:", error.message);
  } finally {
    // Clear the interval and hide the loading spinner
    clearInterval(timerId);
    timerId = null;
    console.info(`${artist}: 100% - End`);
    document.querySelector("#spinnerNumber").innerHTML = "100%";
    document.querySelector("#spinner").classList.remove("loading");
  }
}

/**
 * Checks for new artists on the server.
 */
function checkNew() {
  // Show the loading spinner
  document.querySelector("#spinner").classList.add("loading");
  fetch(`${host}new.php`)
    .then((res) => res.json())
    .then((artists) => {
      if (artists.length > 0) console.info(artists);
    })
    .catch((err) => console.log("Failed to check new artists:", err.message))
    .finally(() => {
      // Hide the loading spinner
      document.querySelector("#spinner").classList.remove("loading");
    });
}

// *** Show/Hide functions

/**
 * Reloads the filter buttons based on the current NSFW state.
 *
 * @param {HTMLElement} root - The root element containing the filter buttons.
 */
function reloadFiltersButtons(root) {
  // Set the default checked state for the NSFW filter button
  root.querySelector(`input[type='radio'][value='${isNsfw}']`).defaultChecked = true;

  // Add click events to the filter buttons
  Array.from(root.querySelectorAll("span > label")).forEach((btn) => {
    addClick(btn, changeFilter);
  });
}

/**
 * Shows or hides the return button based on the specified flag.
 *
 * @param {boolean} showReturnButton - Whether to show the return button.
 */
function showReturnButton(showReturnButton) {
  const navElement = document.querySelector("nav");

  if (showReturnButton) {
    // Show the return button and add a click event
    document.getElementById("returnBtn").removeAttribute("hidden");
    addClick(document.getElementById("returnBtn"), returnIndex);
  } else {
    // Hide the return button
    document.getElementById("returnBtn").setAttribute("hidden", "hidden");
  }
}

/**
 * Shows or hides the navigation bar based on the current page state.
 */
function showNavBar() {
  if (isWelcomePage()) {
    // Show the navigation bar
    document.querySelector("nav").removeAttribute("hidden");
  } else {
    // Hide the navigation bar
    document.querySelector("nav").setAttribute("hidden", "hidden");
  }
}

/**
 * Shows suggestions based on the current search input value.
 *
 * @param {Event} event - The input event.
 */
function showSuggestions(event) {
  // Clear the suggestions list
  emptySuggestions();
  let search = event.currentTarget.value;

  if (search && document.querySelectorAll(".card").length > 1) {
    Array.from(document.querySelectorAll(".card")).forEach((card, idx) => {
      const cardName = card.id.trim();
      const included = cardName.toLowerCase().startsWith(search.toLowerCase());

      // Update the card visibility based on the search term
      card.dataset.hidden = !included;
      card.classList.remove("searched");

      if (included) {
        // Create a suggestion list item
        const li = document.createElement("li");
        li.innerHTML = cardName;
        li.dataset.card = "#" + cardName;
        li.dataset.pos = idx;
        document.querySelector("#suggestions").appendChild(li);

        // Add a click event to the suggestion list item
        addClick(li, transmitClick);
      }
    });

    // Show the backdrop and update the results text
    document.querySelector("#backdrop").classList = "show";
    document.querySelector("#results").innerText =
      document.querySelector("#suggestions").childElementCount +
      " / " +
      Array.from(document.querySelectorAll(".card")).length;
    // Add a keydown event to the search input
    addKeyDown(event.currentTarget, navigateSuggestions);
  }
}

/**
 * Shows the unique suggestion based on the current search input value.
 */
function showUniqueSuggestion() {
  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    const searchTerm = document.querySelector("#search").value.trim();
    if (card.id.toLowerCase().startsWith(searchTerm.toLowerCase())) {
      // Highlight and scroll to the matching card
      card.classList.add("searched");
      setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), 10);
      // Clear the suggestions list
      emptySuggestions();
    } else {
      // Hide non-matching cards
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
    const title = "Welcome " + isNsfw + " | ComEx";
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("isNsfw", newNsfwState);

    // Update the URL and push the new state to the history
    const newUrl = `/Commissions/v2/${page}?` + searchParams.toString();
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
  const title = event.currentTarget.id + " | ComEx";
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("artist") === null) {
    searchParams.append("artist", event.currentTarget.id);
  } else {
    searchParams.set("artist", event.currentTarget.id);
  }

  // Update the URL and push the new state to the history
  const newUrl = `/Commissions/v2/${page}?` + searchParams.toString();
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
  const newUrl = `/Commissions/v2/${page}?` + searchParams.toString();
  history.pushState(state, title, newUrl);
  setPageTitle();
  document.querySelector("#search").value = artist;
}
