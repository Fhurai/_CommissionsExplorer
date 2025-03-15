/**
 * Capitalizes the first letter of a string and converts the rest to lowercase
 *
 * @param {string} string - The input string to transform
 * @returns {string} The transformed string with first letter capitalized
 *
 * @example
 * ucFirst('hello');    // Returns 'Hello'
 * ucFirst('HELLO');    // Returns 'Hello'
 * ucFirst('');         // Returns ''
 *
 * @note Handles empty strings gracefully
 * @warning Does not check input type (expects string)
 */
function ucFirst(string) {
  // Handle empty string case immediately
  if (string.length === 0) return "";

  // Split into first character and remainder
  // Corrected method names: toUppercase → toUpperCase, toLowercase → toLowerCase
  return (
    string.substring(0, 1).toUpperCase() + string.substring(1).toLowerCase()
  );
}

/**
 * Dynamically sets the document title based on URL query parameters.
 *
 * - Uses the "artist" query parameter if present (capitalized via ucFirst())
 * - Defaults to "Welcome | ComEx" when no artist parameter exists
 * - Updates document.title directly
 *
 * @function setPageTitle
 * @example
 * // For URL: https://example.com/?artist=picasso
 * // Sets document.title to "Picasso | ComEx"
 */
function setPageTitle() {
  // Initialize title variable
  let title = "";

  // Parse URL query parameters
  const searchParams = new URLSearchParams(window.location.search);

  // Check for artist parameter existence
  if (searchParams.get("artist") === null) {
    // Default title when no artist specified
    title = "Welcome | ComEx";
  } else {
    // Capitalize artist name and format title
    title = ucFirst(searchParams.get("artist")) + " | ComEx";
  }

  // Update the page title in the document
  document.title = title;
}

function isWelcomePage() {
  return document.title === "Welcome | ComEx";
}

function setIsNsfw() {
  // Parse URL parameters
  const searchParams = new URLSearchParams(window.location.search);

  if (isWelcomePage()) {
    isNsfw = searchParams.get("isNsfw") === "true";
  } else {
    isNsfw = false;
  }
}

function emptySuggestions() {
  document.querySelector("#suggestions").innerHTML = "";
  document.querySelector("#suggestions").classList.remove("show");
  document.querySelector("#backdrop").classList = "";
  document.querySelector("#results").innerText = "";
}

function navigateSuggestions(event) {
  let navigate = true;
  const searchInput = document.getElementById("search");
  const suggestionsList = document.getElementById("suggestions");

  const items = suggestionsList.querySelectorAll("li");
  if (!items.length) return;

  if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
    const currentSelected = suggestionsList.querySelector(".selected");
    let index = Array.from(items).indexOf(currentSelected);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        index = index < items.length - 1 ? index + 1 : 0;
        break;
      case "ArrowUp":
        event.preventDefault();
        index = index > 0 ? index - 1 : items.length - 1;
        break;
      case "Enter":
        if (currentSelected) {
          accessSuggestion(currentSelected.innerText);
        }
        return;
      default:
        return;
    }

    items.forEach((item) => item.classList.remove("selected"));
    items[index].classList.add("selected");
    setTimeout(
      () =>
        items[index].scrollIntoView({ behavior: "smooth", block: "nearest" }),
      10
    );
  } else {
    navigate = false;
  }

  return navigate;
}

function transmitClick(event) {
  accessSuggestion(event.currentTarget.innerText);
}

function accessSuggestion(artistName) {
  const searchField = document.querySelector("#search");
  searchField.value = artistName;
  showUniqueSuggestion();
  searchField.value = "";
}

// *** Load functions

function loadContent() {
  const gallery = document.querySelector("#gallery");
  gallery.innerHTML = isWelcomePage() ? "<span class='push'></span>" : "";
  gallery.style.marginTop = isWelcomePage() ? "" : "unset";
  showReturnButton(!isWelcomePage());

  if (isWelcomePage()) {
    loadArtists();
  } else {
    loadArtworks();
  }
  showNavBar();
}

function loadArtists() {
  setIsNsfw();

  document.querySelector("#spinner").classList.add("loading");
  fetch(`${host}artists.php?isNsfw=${isNsfw}`)
    .then((res) => res.json())
    .then((artists) => {
      document.querySelector("#spinnerNumber").innerText =
        "0 / " + Object.keys(artists).length;
      Object.keys(artists).forEach((artistName, idx) => {
        document.querySelector("#spinnerNumber").innerText =
          idx + " / " + Object.keys(artists).length;
        const card = generateCard(artistName, Object.values(artists)[idx]);
        addClick(card, goToArtist);
      });
    })
    .catch((err) => console.error("Failed to update artist list:", err.message))
    .finally(() => {
      document.querySelector("#spinnerNumber").innerText = "";
      document.querySelector("#spinner").classList.remove("loading");

      addInput(document.querySelector("#search"), showSuggestions);
    });
}

async function loadArtworks() {
  const searchParams = new URLSearchParams(window.location.search);
  const artist = searchParams.get("artist");

  const response = await fetch(`${host}artworks.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ artist: artist }),
  })
    .then((res) => res.json())
    .then((artworks) => {
      artworks = artworks.map((artwork) => {
        return artwork.split("/").splice(1).join("/");
      });

      setThumbnails(artist, artworks);
    })
    .catch((err) => {
      console.error("Failed to update artworks list:", err.message);
    })
    .finally(() => {
      document.querySelector("#spinnerNumber").innerHTML = "";
    });
}

function progress(action, artist) {
  fetch(`${host}progress.php`, {
    method: "POST", // Required (as per CORS headers)
    headers: {
      "Content-Type": "application/x-www-form-urlencoded", // Required for form data
    },
    body: new URLSearchParams({ action: action, artist: artist }), // URL-encoded body
  })
    .then((res) => res.json())
    .then((progressValue) => {
      const percentage = Math.round(progressValue * 10000) / 100;

      if (
        parseFloat(document.querySelector("#spinnerNumber").innerHTML) ===
        percentage
      ) {
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

async function setThumbnails(artist, artworks) {
  document.querySelector("#spinnerNumber").innerText = "0%";
  document.querySelector("#spinner").classList.toggle("loading");

  console.info(`${artist}: 0% - Start`);
  let timerId = setInterval(() => {
    progress("thumbnails", artist);
  }, 1000);

  try {
    // Retrieve thumbnail URLs for selected artworks
    const response = await fetch(`${host}thumbnail.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artworks }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status} response`);

    const thumbnails = await response.json();

    // Display thumbnail gallery
    Object.values(thumbnails).forEach(([fullSizePath, thumbnailPath]) => {
      generatePreview(fullSizePath);
    });
  } catch (error) {
    console.error("Failed to load gallery:", error.message);
  } finally {
    clearInterval(timerId);
    timerId = null;
    console.info(`${artist}: 100% - End`);
    document.querySelector("#spinnerNumber").innerHTML = "100%";
    document.querySelector("#spinner").classList.toggle("loading");
  }
}

function checkNew() {
  document.querySelector("#spinner").classList.add("loading");
  fetch(`${host}new.php`)
    .then((res) => res.json())
    .then((artists) => {
      if(artists.length > 0) console.info(artists);
    })
    .catch((err) => console.log("Failed to check new artists:", err.message))
    .finally(() => {
      document.querySelector("#spinner").classList.remove("loading");
    });
}

// *** Show/Hide functions

function reloadFiltersButtons(root) {
  root.querySelector(
    `input[type='radio'][value='${isNsfw}']`
  ).defaultChecked = true;

  Array.from(root.querySelectorAll("span > label")).forEach((btn) => {
    addClick(btn, changeFilter);
  });
}

function showReturnButton(showReturnButton) {
  const navElement = document.querySelector("nav");

  if (showReturnButton) {
    document.getElementById("returnBtn").removeAttribute("hidden");
    addClick(document.getElementById("returnBtn"), returnIndex);
  } else {
    document.getElementById("returnBtn").setAttribute("hidden", "hidden");
  }
}

function showNavBar() {
  if (isWelcomePage()) {
    document.querySelector("nav").removeAttribute("hidden");
  } else {
    document.querySelector("nav").setAttribute("hidden", "hidden");
  }
}

function showSuggestions() {
  emptySuggestions();
  let search = event.currentTarget.value;

  if (search && document.querySelectorAll(".card").length > 1) {
    Array.from(document.querySelectorAll(".card")).forEach((card, idx) => {
      const cardName = card.id.trim();
      const included = cardName.toLowerCase().startsWith(search.toLowerCase());

      card.dataset.hidden = !included;
      card.classList.remove("searched");

      if (included) {
        const li = document.createElement("li");
        li.innerHTML = cardName;
        li.dataset.card = "#" + cardName;
        li.dataset.pos = idx;
        document.querySelector("#suggestions").appendChild(li);

        addClick(li, transmitClick);
      }
    });

    document.querySelector("#backdrop").classList = "show";
    document.querySelector("#results").innerText =
      document.querySelector("#suggestions").childElementCount +
      " / " +
      Array.from(document.querySelectorAll(".card")).length;
    addKeyDown(event.currentTarget, navigateSuggestions);
  }
}

function showUniqueSuggestion() {
  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    const searchTerm = document.querySelector("#search").value.trim();
    if (card.id.toLowerCase().startsWith(searchTerm.toLowerCase())) {
      card.classList.add("searched");
      setTimeout(
        () => card.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        10
      );
      emptySuggestions();
    } else {
      card.dataset.hidden = true;
    }
  });
}

// *** Move functions

function changeFilter(event) {
  const newNsfwState = event.currentTarget.innerText === "NSFW";
  if (isNsfw !== newNsfwState) {
    const state = { data: "optional state object" };
    const title = "Welcome " + isNsfw + " | ComEx";
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("isNsfw", newNsfwState);

    const newUrl = `/Commissions/v2/${page}?` + searchParams.toString();
    history.pushState(state, title, newUrl);
    document.querySelector("#search").value = "";
  }
}

function goToArtist(event) {
  const state = { data: "optional state object" };
  const title = event.currentTarget.id + " | ComEx";
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("artist") === null) {
    searchParams.append("artist", event.currentTarget.id);
  } else {
    searchParams.set("artist", event.currentTarget.id);
  }

  const newUrl = `/Commissions/v2/${page}?` + searchParams.toString();
  history.pushState(state, title, newUrl);
  setPageTitle();
}

function returnIndex() {
  const state = { data: "optional state object" };
  const title = "Welcome | ComEx";
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.delete("artist");
  const newUrl = `/Commissions/v2/${page}?` + searchParams.toString();
  history.pushState(state, title, newUrl);
  setPageTitle();
}
