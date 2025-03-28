// Global variable to store the total number of commissions.
let totalCommissions = 0;
let sortStates = {
  artists: { order: [], type: "desc" },
};

/**
 * Main initialization
 * This event listener waits for the DOM content to be fully loaded before executing the `getStats` function.
 */
document.addEventListener("DOMContentLoaded", () => {
  getStats();
});

/**
 * Fetches statistics from the API and generates the UI components.
 *
 * This function performs the following steps:
 * 1. Fetches data from the API endpoint.
 * 2. Parses the response as JSON.
 * 3. Calls `generatePanels` to create the main dashboard panels.
 * 4. Calls `generateArtistsPanel` to create individual artist panels.
 * 5. Handles errors using `handleError`.
 * 6. Logs a debug message when the process is complete.
 */
function getStats() {
  fetch("http://naslku.synology.me/Commissions/api/stats.php") // API endpoint for fetching statistics.
    .then((res) => res.json()) // Converts the response to JSON format.
    .then((stats) => {
      generatePanels(stats); // Generates the main dashboard panels.
      document.body.innerHTML += "<hr>"; // Adds a horizontal line for separation.
      generateArtistsTable(stats); // Generates the artists table.
    })
    .catch(handleError) // Handles any errors during the fetch process.
    .finally(() => console.debug("Stats checked.")); // Logs a debug message when done.
}

/**
 * Error handling utility
 *
 * @param {Error} error - The error object containing details about the failure.
 * Logs the error message to the console.
 */
function handleError(error) {
  console.error("Failed to check stats:", error.message);
}

/**
 * Generates all dashboard panels based on the provided statistics.
 *
 * @param {object} stats - The statistics object containing SFW and NSFW data.
 * The `stats` object is expected to have the following structure:
 * {
 *   sfw: { artists: { count: number }, commissions: { count: number }, thumbnails: { count: number } },
 *   nsfw: { artists: { count: number }, commissions: { count: number }, thumbnails: { count: number } }
 * }
 */
function generatePanels(stats) {
  // Generate the "Total" panel with combined statistics.
  generatePanel({
    id: "Total",
    sections: [
      createToggleSection("Artistes", stats, "artists"), // Toggle section for artists.
      createToggleSection("Commissions", stats, "commissions"), // Toggle section for commissions.
      createImageRatioSection(stats), // Image ratio section.
    ],
  });

  // Generate the "SFW" panel with SFW-specific statistics.
  generatePanel({
    id: "SFW",
    sections: [
      createStatItem("Artistes", stats.sfw.artists.count), // SFW artist count.
      createStatItem("Commissions", stats.sfw.commissions.count), // SFW commission count.
      createImageSubsection(stats.sfw, "sfw"), // SFW image subsection.
    ],
  });

  // Generate the "NSFW" panel with NSFW-specific statistics.
  generatePanel({
    id: "NSFW",
    sections: [
      createStatItem("Artistes", stats.nsfw.artists.count), // NSFW artist count.
      createStatItem("Commissions", stats.nsfw.commissions.count), // NSFW commission count.
      createImageSubsection(stats.nsfw, "nsfw"), // NSFW image subsection.
    ],
  });
}

/**
 * Generic panel generator
 *
 * @param {object} config - Configuration object for the panel.
 * The `config` object should have the following structure:
 * {
 *   id: string, // Unique ID for the panel.
 *   sections: array // Array of HTML elements representing sections within the panel.
 * }
 */
function generatePanel(config) {
  const panel = document.createElement("div");
  panel.className = "panel";
  panel.id = config.id;

  config.sections.forEach((section) => {
    const container = createContainer();
    container.appendChild(section);
    panel.appendChild(container);
  });

  document.body.appendChild(panel);
}

function generateArtistsTable(stats) {
  let artists = {
    artists: {
      details: stats.sfw.artists.details.concat(stats.nsfw.artists.details),
    },
    commissions: {
      details: Object.entries(stats.sfw.commissions.details).concat(
        Object.entries(stats.nsfw.commissions.details)
      ),
    },
    thumbnails: {
      details: Object.entries(stats.sfw.thumbnails.details).concat(
        Object.entries(stats.nsfw.thumbnails.details)
      ),
    },
  };
  artists.artists.details.sort();
  artists.commissions.details.sort();
  artists.thumbnails.details.sort();

  artists.sfw = artists.artists.details
    .concat(stats.nsfw.artists.details)
    .map((artist) => {
      return artist in stats.sfw.commissions.details;
    });

  generateTable(artists, "artists");
}

function generateTable(stats, label) {
  const container = document.createElement("div");
  container.classList = "table-container";
  document.body.appendChild(container);

  const searchResults = document.createElement("div");
  searchResults.className = "search-results";
  container.appendChild(searchResults);

  const table = document.createElement("table");
  table.className = "table";
  table.id = label;
  container.appendChild(table);
  const header = document.createElement("thead");
  table.appendChild(header);

  const headerRow = document.createElement("tr");
  header.appendChild(headerRow);

  const searchRow = document.createElement("tr");
  header.appendChild(searchRow);

  [
    "Artist",
    "? sfw",
    "% Total",
    "# Commissions",
    "# Pictures",
    "Ratio P / C",
  ].forEach((header, idx) => {
    const th = document.createElement("th");
    th.textContent = header;
    th.addEventListener("click", clickHeader);
    headerRow.appendChild(th);

    const tdSearch = document.createElement("td");
    const inputSearch = document.createElement("input");
    inputSearch.type = [0, 1].includes(idx) ? "text" : "number";
    if (![0, 1].includes(idx)) {
      inputSearch.step = [3, 4].includes(idx) ? 1 : 0.01;
      inputSearch.min = 0;
    }
    inputSearch.placeholder = header;
    inputSearch.className = "search";
    inputSearch.addEventListener("input", searchColumn);
    tdSearch.appendChild(inputSearch);
    searchRow.appendChild(tdSearch);
  });

  const body = document.createElement("tbody");
  table.appendChild(body);

  Object.entries(stats.artists.details).forEach(([idx, artist]) => {
    const commissions = stats.commissions.details[idx][1];
    const thumbnails = stats.thumbnails.details[idx][1];

    const row = document.createElement("tr");
    row.classList = idx % 2 === 0 ? "even" : "odd"; // Add alternating row classes
    row.innerHTML = `
            <td>${artist}</td>
            <td class='${stats.sfw[idx] ? "sfw" : "nsfw"}'>${
      stats.sfw[idx] ? "Yes" : "No"
    }</td>
            <td>${calculatePercentage(commissions, totalCommissions)}%</td>
            <td>${commissions}</td>
            <td>${thumbnails}</td>
            <td>${calculatePercentage(thumbnails, commissions)}%</td>`;
    body.appendChild(row);
  });
}

/**
 * Handles column search input events.
 * @param {Event} event - Input event from search field.
 */
function searchColumn(event) {
  const td = event.currentTarget.parentElement; // Get the parent <td> of the input field.
  const col = Array.from(td.parentElement.children).findIndex(function (el) {
    return el === td; // Find the column index of the input field.
  });
  const searchValue = event.currentTarget.value.trim().toLowerCase(); // Normalize the search value.

  td.closest("table")
    .querySelectorAll(`tbody tr`) // Select all rows in the table body.
    .forEach((row) => {
      const fieldValue = [0, 1, 2, 5].includes(col)
        ? row
            .querySelector(`td:nth-child(${col + 1})`) // Get the cell in the current column.
            .innerText.trim()
            .substring(0, searchValue.length)
            .toLowerCase() // Normalize the cell value.
        : row
            .querySelector(`td:nth-child(${col + 1})`)
            .innerText.trim()
            .toLowerCase();

      let colArray;

      if (row.dataset.hidden !== undefined) {
        colArray = JSON.parse(row.dataset.hidden); // Parse the hidden column array if it exists.
      } else {
        colArray = []; // Initialize an empty array if it doesn't exist.
      }

      if (!fieldValue.includes(searchValue) && searchValue !== "") {
        if (!colArray.includes(col)) colArray.push(col); // Add the column index to the hidden array if it doesn't match.
      } else {
        const index = colArray.indexOf(col);
        if (index > -1) {
          colArray.splice(index, 1); // Remove the column index if it matches.
        }
      }

      row.dataset.hidden = JSON.stringify(colArray); // Update the hidden column array in the dataset.
    });

  hideRow(); // Hide rows based on the updated hidden column array.

  // Update the search results display.
  if (document.querySelectorAll("table tbody tr[hidden]").length > 0) {
    document.querySelector(".search-results").classList = "search-results filled";
    document.querySelector(".search-results").innerHTML = `Search results: ${
      document.querySelectorAll("table tbody tr").length -
      document.querySelectorAll("table tbody tr[hidden]").length
    } results`;
  } else {
    document.querySelector(".search-results").classList = "search-results";
    document.querySelector(".search-results").innerHTML = "";
  }
}

/**
 * Toggles row visibility based on search filters.
 */
function hideRow() {
  document.querySelectorAll("table tbody tr").forEach((row) => {
    if (row.dataset.hidden !== undefined) {
      const colArray = JSON.parse(row.dataset.hidden); // Parse the hidden column array.
      if (colArray.length > 0) {
        row.setAttribute("hidden", "hidden"); // Hide the row if the array is not empty.
      } else {
        row.removeAttribute("hidden"); // Show the row if the array is empty.
      }
    }
  });
}

/**
 * Handles column header clicks for sorting.
 * @param {Event} event - Click event from header.
 */
function clickHeader(event) {
  const table = event.currentTarget.closest("table");
  const tableId = table.id;
  const th = event.currentTarget;
  const colIndex = Array.from(th.parentElement.children).indexOf(th);

  // Update sorting state
  const state = sortStates[tableId];
  const existingIndex = state.order.findIndex(
    (item) => item.column === colIndex
  );

  if (existingIndex === -1) {
    // New column sorting
    state.order.push({ column: colIndex, direction: "asc" });
    th.classList.toggle("asc");
  } else {
    // Update existing column sorting
    const currentDirection = state.order[existingIndex].direction;
    if (currentDirection === "asc") {
      state.order[existingIndex].direction = "desc";
      th.classList.toggle("asc");
      th.classList.toggle("desc");
    } else {
      // Remove column from sorting
      state.order.splice(existingIndex, 1);
      th.classList.toggle("desc");
      delete th.dataset.position;
    }
  }

  // Update UI and sort table
  updateSortIndicators(table);
  sortTable(table);
}

/**
 * Updates visual indicators for sorted columns.
 * @param {HTMLTableElement} table - Target table to update.
 */
function updateSortIndicators(table) {
  const state = sortStates[table.id];
  const headers = table.querySelectorAll("th");

  headers.forEach((header, index) => {
    const sortIndex = state.order.findIndex((item) => item.column === index);
    if (sortIndex > -1) {
      header.dataset.position = sortIndex + 1;
    } else {
      delete header.dataset.position;
    }
  });
}

/**
 * Sorts table rows based on current sortStates.
 * @param {HTMLTableElement} table - Table to sort.
 */
function sortTable(table) {
  const state = sortStates[table.id];
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const headers = table.querySelectorAll("th");

  rows.sort((a, b) => {
    if (Object.entries(state.order).length > 0) {
      for (const sort of state.order) {
        const colIndex = sort.column;
        const direction = sort.direction === "asc" ? 1 : -1;
        const aCell = a.cells[colIndex];
        const bCell = b.cells[colIndex];
        const aValue = parseValue(aCell.textContent, [0, 1].includes(colIndex));
        const bValue = parseValue(bCell.textContent, [0, 1].includes(colIndex));

        if (aValue !== bValue) {
          return aValue > bValue ? direction : -direction;
        }
      }
    } else {
      const aCell = a.cells[0];
      const bCell = b.cells[0];
      const aValue = parseValue(aCell.textContent, true);
      const bValue = parseValue(bCell.textContent, true);

      if (aValue !== bValue) {
        return aValue > bValue ? 1 : -1;
      }
    }
    return 0;
  });

  // Update DOM
  tbody.innerHTML = "";
  rows.forEach((row, idx) => {
    row.classList = idx % 2 === 0 ? "even" : "odd"; // Add alternating row classes
    tbody.appendChild(row);
  });
}

/**
 * Parses cell content for sorting (numeric or string).
 * @param {string} content - Cell text content.
 * @param {boolean} isString - Whether to treat as string.
 * @returns {number|string} - Parsed value for comparison.
 */
function parseValue(content, isString) {
  const numericValue = Number(content.replace(/[^0-9.-]/g, ""));
  if (!isNaN(numericValue) && !isString) {
    return numericValue;
  } else {
    return content.toLowerCase();
  }
}

/**
 * Creates toggleable statistic section
 *
 * @param {string} label - The label for the section (e.g., "Artistes", "Commissions").
 * @param {object} stats - The statistics object containing SFW and NSFW data.
 * @param {string} type - The type of data ("artists" or "commissions").
 * @returns {HTMLElement} - The generated section element.
 */
function createToggleSection(label, stats, type) {
  const total = stats.sfw[type].count + stats.nsfw[type].count;
  if (type === "commissions") totalCommissions = total;
  const percentage = calculatePercentage(stats.sfw[type].count, total);

  const section = document.createElement("div");
  section.innerHTML = `
        <input type="checkbox" id="checkbox-${label}">
        <label class="stat" for="checkbox-${label}">
            ${label}: ${total}
        </label>
        <div class="stat-container">
            <div class="pie-chart" id="ratio-${type.toLowerCase()}" 
                 style="--ratio-var: ${percentage}%"></div>
            <div class="values">
                <div class="sfw">sfw: ${percentage}%</div>
                <div class="nsfw">nsfw: ${100 - percentage}%</div>
            </div>
        </div>
    `;

  return section;
}

/**
 * Creates image ratio subsection
 *
 * @param {object} data - The data object containing statistics for SFW or NSFW.
 * @param {string} type - The type of data ("sfw" or "nsfw").
 * @returns {HTMLElement} - The generated subsection element.
 */
function createImageSubsection(data, type) {
  const images = data.thumbnails.count;
  const others = data.commissions.count - images;
  const percentage = calculatePercentage(images, data.commissions.count);

  const section = document.createElement("div");
  section.innerHTML = `
        <input type="checkbox" id="checkbox-images-${type}">
        <label class="stat" for="checkbox-images-${type}">
            Images: ${images} - Others: ${others}
        </label>
        <div class="stat-container">
            <div class="pie-chart" id="ratio-images-${type}" 
                 style="--ratio-var: ${percentage}%"></div>
            <div class="values">
                <div class="sfw">pictures: ${percentage}%</div>
                <div class="nsfw">others: ${calculatePercentage(
                  others,
                  data.commissions.count
                )}%</div>
            </div>
        </div>
    `;

  return section;
}

/**
 * Creates image ratio section for Total panel
 *
 * @param {object} stats - The statistics object containing SFW and NSFW data.
 * @returns {HTMLElement} - The generated section element.
 */
function createImageRatioSection(stats) {
  const totalImages = stats.sfw.thumbnails.count + stats.nsfw.thumbnails.count;
  const totalCommissions =
    stats.sfw.commissions.count + stats.nsfw.commissions.count;
  const others = totalCommissions - totalImages;
  const percentage = calculatePercentage(totalImages, totalCommissions);

  const section = document.createElement("div");
  section.innerHTML = `
        <input type="checkbox" id="checkbox-images-total">
        <label class="stat" for="checkbox-images-total">
            Images: ${totalImages} - Others: ${others}
        </label>
        <div class="stat-container">
            <div class="pie-chart" id="ratio-images" 
                 style="--ratio-var: ${percentage}%"></div>
            <div class="values">
                <div class="sfw">pictures: ${percentage}%</div>
                <div class="nsfw">others: ${
                  Math.round((100 - percentage + Number.EPSILON) * 100) / 100
                }%</div>
            </div>
        </div>
    `;

  return section;
}

/**
 * Utility function to create a container element.
 *
 * @returns {HTMLElement} - A div element with the class "container".
 */
function createContainer() {
  const container = document.createElement("div");
  container.className = "container";
  return container;
}

/**
 * Utility function to create a statistic item.
 *
 * @param {string} label - The label for the statistic (e.g., "Artistes").
 * @param {number} value - The value of the statistic.
 * @returns {HTMLElement} - A div element representing the statistic.
 */
function createStatItem(label, value) {
  const element = document.createElement("div");
  element.className = "stat";
  element.textContent = `${label}: ${value}`;
  return element;
}

/**
 * Calculates the percentage of a numerator relative to a denominator.
 *
 * @param {number} numerator - The numerator value.
 * @param {number} denominator - The denominator value.
 * @returns {number} - The calculated percentage.
 * Returns 0 if the denominator is 0 to avoid division by zero.
 */
function calculatePercentage(numerator, denominator) {
  return denominator === 0
    ? 0
    : Math.round((numerator / denominator) * 10000) / 100; // Return 0 if denominator is 0, otherwise calculate percentage.
}
