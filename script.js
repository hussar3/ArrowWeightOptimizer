function addRow(i, shaft = "", insert = "", point = "") {
  const tableBody = document.querySelector("#arrow-table tbody");
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td>${i}</td>
    <td><input type="number" step="0.1" id="shaft-${i}" value="${shaft}"></td>
    <td><input type="number" step="0.1" id="insert-${i}" value="${insert}"></td>
    <td><input type="number" step="0.1" id="point-${i}" value="${point}"></td>
  `;
  tableBody.appendChild(newRow);

  newRow.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
      const lastRow = tableBody.lastElementChild;
      const inputs = lastRow.querySelectorAll("input");
      let allFilled = true;
      inputs.forEach(i => {
        if (!i.value) allFilled = false;
      });
      if (allFilled) {
        const nextIndex = tableBody.rows.length + 1;
        addRow(nextIndex);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  for (let i = 1; i <= 5; i++) {
    addRow(i);
  }
});

function importCSV() {
  const fileInput = document.getElementById("csv-input");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a CSV file first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const text = event.target.result;
    const rows = text.trim().split("\n").map(row => row.split(","));
    const headers = rows.shift().map(h => h.trim().toLowerCase());

    const shaftIndex = headers.indexOf("shaft");
    const insertIndex = headers.indexOf("insert");
    const pointIndex = headers.indexOf("point");

    if (shaftIndex === -1 || insertIndex === -1 || pointIndex === -1) {
      alert("CSV must contain headers: Shaft, Insert, Point");
      return;
    }

    const tableBody = document.querySelector("#arrow-table tbody");
    tableBody.innerHTML = "";

    rows.forEach((cols, i) => {
      const shaft = cols[shaftIndex]?.trim() || "";
      const insert = cols[insertIndex]?.trim() || "";
      const point = cols[pointIndex]?.trim() || "";
      addRow(i + 1, shaft, insert, point);
    });

    alert("CSV imported successfully!");
  };

  reader.readAsText(file);
}

function optimizeWeights() {
  const tableBody = document.querySelector("#arrow-table tbody");
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "";

  const shafts = [], inserts = [], points = [];

  for (let i = 0; i < tableBody.rows.length; i++) {
    const shaft = parseFloat(document.querySelector(`#shaft-${i + 1}`)?.value);
    const insert = parseFloat(document.querySelector(`#insert-${i + 1}`)?.value);
    const point = parseFloat(document.querySelector(`#point-${i + 1}`)?.value);
    if (!isNaN(shaft)) shafts.push({ id: i + 1, value: shaft });
    if (!isNaN(insert)) inserts.push({ id: i + 1, value: insert });
    if (!isNaN(point)) points.push({ id: i + 1, value: point });
  }

  const N = Math.min(shafts.length, inserts.length, points.length);
  if (N === 0) {
    outputDiv.textContent = "Enter at least one shaft, insert, and point.";
    return;
  }

  const median = inserts.map(i => i.value).sort((a, b) => a - b)[Math.floor(inserts.length / 2)];
  const sortedShafts = [...shafts].sort((a, b) => a.value - b.value);
  const sortedInserts = [...inserts].sort((a, b) => Math.abs(a.value - median) - Math.abs(b.value - median));
  const sortedPoints = [...points].sort((a, b) => b.value - a.value);

  const result = [];

  for (let i = 0; i < N; i++) {
    result.push({
      shaftId: sortedShafts[i].id,
      insertId: sortedInserts[i].id,
      pointId: sortedPoints[i].id,
      total: sortedShafts[i].value + sortedInserts[i].value + sortedPoints[i].value
    });
  }

  result.sort((a, b) => a.total - b.total);

  const avg = result.reduce((sum, c) => sum + c.total, 0) / N;
  const stdDev = Math.sqrt(result.reduce((sum, c) => sum + Math.pow(c.total - avg, 2), 0) / N);
  const min = Math.min(...result.map(c => c.total));
  const max = Math.max(...result.map(c => c.total));
  const delta = max - min;

  const summary = document.createElement("div");
  summary.innerHTML = `
    <strong>Optimized arrow set (Median-Balanced Inserts Strategy)</strong><br>
    Std Dev: ${stdDev.toFixed(2)} grains<br>
    Lightest: ${min.toFixed(1)} grains<br>
    Heaviest: ${max.toFixed(1)} grains<br>
    Difference: ${delta.toFixed(2)} grains
  `;

  const tracker = document.createElement("p");
  tracker.style.fontWeight = "bold";
  tracker.style.margin = "10px 0";

  const list = document.createElement("ul");
  list.style.listStyleType = "none";
  list.style.padding = "0";

  result.forEach((combo, index) => {
    const li = document.createElement("li");
    li.className = "arrow-result-row";
    li.innerHTML = `
      <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
        <input type="checkbox" class="arrow-checkbox" />
        <span>Arrow ${index + 1}: shaft ${combo.shaftId}, insert ${combo.insertId}, point ${combo.pointId} → total ${combo.total.toFixed(1)} grains</span>
      </label>
    `;
    list.appendChild(li);
  });

  function updateTracker() {
    const total = list.querySelectorAll(".arrow-checkbox").length;
    const checked = list.querySelectorAll(".arrow-checkbox:checked").length;
    tracker.textContent = `✅ ${checked} of ${total} arrows built`;
  }

  list.querySelectorAll(".arrow-checkbox").forEach(checkbox => {
    checkbox.addEventListener("change", function () {
      const row = this.closest(".arrow-result-row");
      if (this.checked) {
        row.classList.add("checked");
      } else {
        row.classList.remove("checked");
      }
      updateTracker();
    });
  });

  updateTracker();
  outputDiv.appendChild(summary);
  outputDiv.appendChild(tracker);
  outputDiv.appendChild(list);
}


function clearTable() {
  if (!confirm("Are you sure you want to clear all arrow data?")) return;

  const tableBody = document.querySelector("#arrow-table tbody");
  tableBody.innerHTML = ""; // Remove all rows

  for (let i = 1; i <= 5; i++) {
    addRow(i); // Rebuild 5 blank rows
  }

  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "";
}
