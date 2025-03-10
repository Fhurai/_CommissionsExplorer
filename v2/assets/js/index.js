/*
 * index.js - Manages artist gallery display, content filtering, and search functionality.
 * Fetches artist data from a remote API and dynamically generates gallery cards.
 * Allows filtering by NSFW/SFW content and searching artists with live suggestions.
 */

// Base URL for API endpoints
const host = "http://naslku.synology.me/Commissions/api/";
// Global flag for NSFW content filtering
var isNsfw;

// *****************************************
// *** Event Listeners Initialization

// Initialize when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  loadContent();

  window.navigation.addEventListener("navigatesuccess", function () {
    loadContent();
  });
});

// *****************************************
// *** Content Filtering

/**
 * Handles content filtering between NSFW/SFW modes via navigation buttons.
 *
 * Initializes click listeners on all filter buttons in the navigation. When clicked:
 * 1. Determines requested content mode from button text ("NSFW" or implicit "SFW")
 * 2. Compares with current filter state to avoid redundant operations
 * 3. Updates global filter state (isNsfw) when mode changes
 * 4. Triggers artist reload with new filter settings
 * 5. Resets search input to ensure UI consistency with content mode
 *
 * Note: Relies on button text content being exact match for "NSFW". Ensure
 * button labels remain stable or implement data-attributes for more robust check.
 */
function clickContentFilter() {
  Array.from(document.querySelectorAll("nav span label")).forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const newNsfwState = e.currentTarget.innerText === "NSFW";
      if (isNsfw !== newNsfwState) {
        const state = { data: "optional state object" };
        const title = "Welcome | ComEx";
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("isNsfw", newNsfwState);

        const newUrl = "/Commissions/v2/?" + searchParams.toString();
        history.pushState(state, title, newUrl);
        document.querySelector("#search").value = ""; // Reset search
      }
    });
  });
}

// *****************************************
// *** Search Functionality

/**
 * Handles search input events with debouncing
 * Triggers suggestion display on input change
 */
function InputSearchField() {
  document
    .querySelector("#search")
    .removeEventListener("input", searchWithSuggestion);
  document
    .querySelector("#search")
    .addEventListener("input", searchWithSuggestion);
}

function KeyDownSearchField() {
    document
    .querySelector("#search")
    .removeEventListener("keydown", navigateSuggestions);
  document
    .querySelector("#search")
    .addEventListener("keydown", navigateSuggestions);
}

/**
 * Handles click events on search suggestion items
 * Note: Currently clears search field after selection (potential UX issue)
 */
function clickSuggestion() {
  document.querySelectorAll("nav span ul li").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const searchField = document.querySelector("#search");
      searchField.value = e.currentTarget.innerText;
      emptySuggestions();
      showUniqueSuggestion();
      searchField.value = ""; // Immediate clearance might be unintended
    });
  });
}

function clickCards() {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", function () {
      const state = { data: "optional state object" };
      const title = card.id + " | ComEx";
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("artist") === null) {
        searchParams.append("artist", card.id);
      } else {
        searchParams.set("artist", card.id);
      }

      const newUrl = "/Commissions/v2/?" + searchParams.toString();
      history.pushState(state, title, newUrl);
    });
  });
}

function clickReturn() {
  document
    .getElementById("returnButton")
    .addEventListener("click", function () {
      const state = { data: "optional state object" };
      const title = "Welcome | ComEx";
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete("artist");
      const newUrl = "/Commissions/v2/?" + searchParams.toString();
      history.pushState(state, title, newUrl);
    });
}

// *****************************************
// *** UI Visibility Control

/**
 * Controls visibility of filter buttons and adjusts gallery spacing
 * @param {boolean} showButtons - Determines if control buttons should be visible
 */
function showButtons(showButtons) {
  const navElement = document.querySelector("nav");
  if (showButtons) {
    document.querySelector(
      `input[type='radio'][value='${isNsfw}']`
    ).defaultChecked = true;
  } else {
    document.querySelectorAll("nav > span").forEach((elt) => {
      elt.setAttribute("style", "display:none");
    });
    document.querySelector("#gallery").style.marginTop = "0rem";
  }
}

function showReturnButton(showReturnButton) {
  const navElement = document.querySelector("nav");

  if (showReturnButton) {
    document.getElementById("returnButton").removeAttribute("hidden");
    clickReturn();
  } else {
    document.getElementById("returnButton").setAttribute("hidden", "hidden");
  }
}

// ******************************************
// *** LoadContent

function loadContent() {
  // Parse URL parameters
  const searchParams = new URLSearchParams(window.location.search);

  const gallery = document.querySelector("#gallery");
  if (!document.querySelector("nav").hasAttribute("hidden"))
    gallery.innerHTML = "<span class='push'></span>";
  else gallery.innerHTML = "";

  if (
    searchParams.size === 0 ||
    (searchParams.size === 1 && searchParams.get("isNsfw") !== null)
  ) {
    isNsfw = searchParams.get("isNsfw") === "true"; // Convert string to boolean
    // Control UI elements visibility
    showButtons(searchParams.get("isNsfw") !== null);
    gallery.style.marginTop = "";
    document.querySelector("nav").removeAttribute("hidden");
    loadArtists(); // Initial artist load
    showReturnButton(false);
  } else {
    gallery.style.marginTop = "unset";
    document.querySelector("nav").setAttribute("hidden", "hidden");
    loadArtworks(searchParams.get("artist"));
    showReturnButton(true);
  }
}

function loadArtists() {
  document.querySelector("#spinner").classList.add("loading");
  fetch(`${host}artists.php?isNsfw=${isNsfw}`)
    .then((res) => res.json())
    .then((artists) => {
      document.querySelector("#spinnerNumber").innerText =
        "0 / " + Object.keys(artists).length;
      Object.keys(artists).forEach((artistName, idx) => {
        document.querySelector("#spinnerNumber").innerText =
          idx + " / " + Object.keys(artists).length;
        createCard(artistName, Object.values(artists)[idx]);
      });
      clickCards();
    })
    .catch((err) => console.error("Failed to update artist list:", err.message))
    .finally(() => {
      // Set up interactive elements
      clickContentFilter(); // NSFW/SFW toggle
      InputSearchField(); // Search input handling
      KeyDownSearchField(); // Navigation in suggestions
      document.querySelector("#spinnerNumber").innerText = "";
      document.querySelector("#spinner").classList.remove("loading");
    });
}

/**
 * Creates gallery card for individual artist
 * @param {string} artistName - Display name for the artist
 * @param {string} thumb - URL path to artist thumbnail
 */
function createCard(artistName, thumb) {
  // Image element setup
  const img = document.createElement("img");
  img.src = thumb;
  img.alt = `picture by ${artistName}`;

  // Special handling for placeholder image
  if (thumb === "./assets/img/folder.png") {
    img.style.width = "200px";
  }

  // Container element creation
  const container = document.createElement("div");
  container.className = "img-div";
  container.appendChild(img);

  // Card element assembly
  const div = document.createElement("div");
  div.className = "card";
  div.id = artistName;
  div.appendChild(container);

  // Image load handler for layout adjustments
  img.onload = function () {
    if (img.naturalHeight < 250) {
      img.style.width = "unset";
      img.style.height = "100%";
      container.style.display = "flex";
      container.style.justifyContent = "center";
    }
  };

  document.querySelector("#gallery").appendChild(div);
}

function loadArtworks(artist) {
  let arts;

  fetch(`${host}artworks.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ artist: artist }),
  })
    .then((res) => res.json())
    .then((artworks) => {
      // Return the Promise.all to chain it
      arts = artworks;
      return Promise.all(
        Object.values(artworks).map((artwork) => {
          return createPreview(artwork);
        })
      );
    })
    .then((results) => {
      // This runs after all promises resolve
      let timeId = startProgress("thumbnails", artist);
      document.querySelector("#spinner").classList.add("loading");
      results.forEach(async (result, idx) => {
        if (result === undefined) {
          // document.querySelector("#gallery").innerHTML = "";
          try {
            const artworkPath = arts[idx].split("/").slice(1).join("/");
            const response = await fetch(`${host}thumbnail.php`, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({ artwork: artworkPath }),
            });

            const artworks = await response.json();
            createPreview(artworks[0][0]);
          } catch (error) {
            createPreview(arts[idx]);
          }
        }
      });
      clearInterval(timeId);
      document.querySelector("#spinner").classList.remove("loading");
    })
    .catch((err) => {
      console.error("Failed to update artworks list:", err.message);
    });
}

async function createPreview(link) {
  const getExtension = (link) => {
    const filename = link.split("/").pop() || "";
    return filename.split(".").pop().toLowerCase();
  };

  const img = document.createElement("img");
  let fallbackAttempted = false;
  const extension = getExtension(link);

  // Setup image load promise
  const imageLoaded = new Promise((resolve) => {
    img.onload = () => {
      resolve();
    };
    img.onerror = () => {
      if (!fallbackAttempted) {
        fallbackAttempted = true;
        img.src = link; // Fallback image
        img.onload = resolve;
      } else {
        resolve(); // Resolve despite errors to proceed
      }
    };
  });

  // Configure image based on type
  switch (true) {
    case ["jpg", "jpeg", "png"].includes(extension):
      img.src = link.replace("/commissions/", "/thumbs/");
      break;
    case ["mp4", "mov", "gif"].includes(extension):
      img.src = "./assets/img/film.png";
      img.style.width = "200px";
      break;
    case ["wav", "mp3"].includes(extension):
      img.src = "./assets/img/music.png";
      img.style.width = "200px";
      break;
    case ["txt", "md"].includes(extension):
      img.src = "./assets/img/file.png";
      img.style.width = "200px";
      break;
    default:
      img.src = ""; // Trigger onerror for fallback
  }
  img.alt = `Preview for ${link}`;

  // Create and append elements
  const container = document.createElement("a");
  container.className = "img-div";
  container.href = link;
  container.target = "_blank";
  container.append(img);

  const previewDiv = document.createElement("div");
  previewDiv.className = "preview";
  previewDiv.id =
    link.split("/").pop().replaceAll(" ", "") || Date.now().toString();
  previewDiv.append(container);

  img.onload = () => {
    if (img.naturalHeight < 250) {
      Object.assign(img.style, {
        width: "unset",
        height: "100%",
      });
      Object.assign(container.style, {
        display: "flex",
        justifyContent: "center",
      });
    }
  };

  if (
    document.getElementById(previewDiv.id) !== null &&
    document.getElementById(previewDiv.id) !== undefined
  ) {
    document
      .querySelector("#gallery")
      .removeChild(document.getElementById(previewDiv.id));
  }

  document.querySelector("#gallery").append(previewDiv);
  await imageLoaded; // Wait for image or fallback to load
}

// *****************************************
// *** Search Implementation

/**
 * Filters artists and shows search suggestions
 * @param {Event} event - Current search query
 */
function searchWithSuggestion(event) {
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
      }
    });

    // Show suggestions dropdown
    if (!document.querySelector("#suggestions").classList.contains("show")) {
      document.querySelector("#results").innerText =
        document.querySelector("#suggestions").childElementCount +
        " / " +
        Array.from(document.querySelectorAll(".card")).length;
      document.querySelector("#suggestions").classList.add("show");
      document.querySelector("#backdrop").classList = "show";
    }
    clickSuggestion();

    // Auto-handle single match scenario
    if (document.querySelectorAll("#suggestions li").length === 1) {
      document.querySelector("#search").disabled = true;
      emptySuggestions();
      showUniqueSuggestion();
      document.querySelector("#search").value = "";
      document.querySelector("#search").disabled = false;
    }
  }
}

/**
 * Clears search suggestions UI
 */
function emptySuggestions() {
  document.querySelector("#suggestions").innerHTML = "";
  document.querySelector("#suggestions").classList.remove("show");
  document.querySelector("#backdrop").classList = "";
  document.querySelector("#results").innerText = "";
}

/**
 * Highlights and scrolls to unique search match
 */
function showUniqueSuggestion() {
  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    const searchTerm = document.querySelector("#search").value.trim();
    if (card.id.toLowerCase().startsWith(searchTerm.toLowerCase())) {
      card.classList.add("searched");
      setTimeout(
        () => card.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        10
      );
    }
  });
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
          const searchField = document.querySelector("#search");
          searchField.value = currentSelected.innerText;
          emptySuggestions();
          showUniqueSuggestion();
          searchField.value = ""; // Immediate clearance might be unintended
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

function startProgress(action, artist) {
  const id = setInterval(function () {
    fetch(`${host}progress.php`, {
      method: "POST", // Required (as per CORS headers)
      headers: {
        "Content-Type": "application/x-www-form-urlencoded", // Required for form data
      },
      body: new URLSearchParams({ action: action, artist: artist }), // URL-encoded body
    })
      .then((res) => res.json())
      .then((progress) => {
        document.querySelector("#spinnerNumber").innerText =
          Math.round((progress * 10000) / 100).toString() + "%";
      })
      .catch((err) =>
        console.error("Failed to update artworks list:", err.message)
      );
  }, 500);
  return id;
}
