document.addEventListener("DOMContentLoaded", () => getStats());

function getStats() {
  fetch("http://naslku.synology.me/Commissions/api/stats.php")
    .then((res) => res.json())
    .then((stats) => {
      generatePanels(stats);
      document.body.innerHTML += "<hr>";
      generateArtistsTable(stats);
    })
    .catch((error) => console.error("Failed to check stats:", error.message))
    .finally(() => console.debug("Stats checked."));
}

function generatePanels(stats) {
  generatePanel({
    id: "Total",
    sections: [
      createToggleSection("Artistes", stats, "artists"),
      createToggleSection("Commissions", stats, "commissions"),
      createImageRatioSection(stats),
    ],
  });

  generatePanel({
    id: "SFW",
    sections: [
      createStatItem("Artistes", stats.sfw.artists.count),
      createStatItem("Commissions", stats.sfw.commissions.count),
      createImageSubsection(stats.sfw, "sfw"),
    ],
  });

  generatePanel({
    id: "NSFW",
    sections: [
      createStatItem("Artistes", stats.nsfw.artists.count),
      createStatItem("Commissions", stats.nsfw.commissions.count),
      createImageSubsection(stats.nsfw, "nsfw"),
    ],
  });
}

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
  generateTable(stats.sfw, "sfw");
  const hr = document.createElement("hr");
  document.body.appendChild(hr);
  generateTable(stats.nsfw, "nsfw");
}

function generateTable(stats, label) {
  const container = document.createElement("div");
  container.classList = "table-container";
  document.body.appendChild(container);

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

  ["Artist", "# Commissions", "% Total", "# Pictures", "Ratio P / C"].forEach(
    (header, idx) => {
      const th = document.createElement("th");
      th.textContent = header;
      th.addEventListener("click", clickHeader);
      headerRow.appendChild(th);

      const tdSearch = document.createElement("td");
      const inputSearch = document.createElement("input");
      inputSearch.type = idx === 0 ? "text" : "number";
      if (idx !== 0) {
        inputSearch.step = [1, 3].includes(idx) ? 1 : 0.01;
        inputSearch.min = 0;
      }
      inputSearch.placeholder = header;
      inputSearch.className = "search";
      inputSearch.id = "search" + label.replace(" ", "").trim() + header.replace(" ", "").trim();
      inputSearch.name = header;
      inputSearch.addEventListener("input", searchColumn);
      tdSearch.appendChild(inputSearch);
      searchRow.appendChild(tdSearch);
    }
  );

  const body = document.createElement("tbody");
  table.appendChild(body);

  Object.entries(stats.artists.details).forEach(([idx, artist]) => {
    const commissions = Object.entries(stats.commissions.details)[idx][1];
    const thumbnails = Object.entries(stats.thumbnails.details)[idx][1];

    const row = document.createElement("tr");
    row.classList = idx % 2 ? "even" : "odd";
    row.innerHTML = `
            <td>${artist}</td>
            <td>${commissions}</td>
            <td>${calculatePercentage(commissions, totalCommissions)}%</td>
            <td>${thumbnails}</td>
            <td>${calculatePercentage(thumbnails, commissions)}%</td>`;
    body.appendChild(row);
  });
}

function searchColumn(event) {
  const td = event.currentTarget.parentElement;
  const col = Array.from(td.parentElement.children).findIndex((el) => el === td);
  const searchValue = event.currentTarget.value.trim().toLowerCase();

  td.closest("table")
    .querySelectorAll(`tbody tr`)
    .forEach((row) => {
      const fieldValue = col === 0 ? row
        .querySelector(`td:nth-child(${col + 1})`)
        .innerText.trim()
        .substring(0, searchValue.length)
        .toLowerCase() : row
        .querySelector(`td:nth-child(${col + 1})`)
        .innerText.trim()
        .toLowerCase();
      let colArray;

      if (row.dataset.hidden !== undefined) {
        colArray = JSON.parse(row.dataset.hidden);
      } else {
        colArray = [];
      }

      if (!fieldValue.includes(searchValue) && searchValue !== "") {
        if (!colArray.includes(col)) colArray.push(col);
      } else {
        const index = colArray.indexOf(col);
        if (index > -1) {
          colArray.splice(index, 1);
        }
      }

      row.dataset.hidden = JSON.stringify(colArray);
    });

  hideRow();
}

function hideRow() {
  document.querySelectorAll("table tbody tr").forEach((row) => {
    if (row.dataset.hidden !== undefined) {
      const colArray = JSON.parse(row.dataset.hidden);
      if (colArray.length > 0) {
        row.setAttribute("hidden", "hidden");
      } else {
        row.removeAttribute("hidden");
      }
    }
  });
}

function clickHeader(event) {
  const table = event.currentTarget.closest("table");
  const tableId = table.id;
  const th = event.currentTarget;
  const colIndex = Array.from(th.parentElement.children).indexOf(th);

  const state = sortStates[tableId];
  const existingIndex = state.order.findIndex((item) => item.column === colIndex);

  if (existingIndex === -1) {
    state.order.push({ column: colIndex, direction: "asc" });
    th.dataset.order = "▲";
  } else {
    const currentDirection = state.order[existingIndex].direction;
    if (currentDirection === "asc") {
      state.order[existingIndex].direction = "desc";
      th.dataset.order = "▼";
    } else {
      state.order.splice(existingIndex, 1);
      delete th.dataset.order;
      delete th.dataset.position;
    }
  }

  updateSortIndicators(table);
  sortTable(table);
}

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

function sortTable(table) {
  const state = sortStates[table.id];
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  rows.sort((a, b) => {
    if (Object.entries(state.order).length > 0) {
      for (const sort of state.order) {
        const colIndex = sort.column;
        const direction = sort.direction === "asc" ? 1 : -1;
        const aCell = a.cells[colIndex];
        const bCell = b.cells[colIndex];
        const aValue = parseValue(aCell.textContent, colIndex === 0);
        const bValue = parseValue(bCell.textContent, colIndex === 0);

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

  tbody.innerHTML = "";
  rows.forEach((row) => tbody.appendChild(row));
}

function parseValue(content, isString) {
  const numericValue = Number(content.replace(/[^0-9.-]/g, ""));
  if (!isNaN(numericValue) && !isString) {
    return numericValue;
  } else {
    return content.toLowerCase();
  }
}

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

function createContainer() {
  const container = document.createElement("div");
  container.className = "container";
  return container;
}

function createStatItem(label, value) {
  const element = document.createElement("div");
  element.className = "stat";
  element.textContent = `${label}: ${value}`;
  return element;
}

function calculatePercentage(numerator, denominator) {
  return denominator === 0
    ? 0
    : Math.round((numerator / denominator) * 10000) / 100;
}
