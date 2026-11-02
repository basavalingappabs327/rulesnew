// Paste your copied Google Apps Script Executable URL here
const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwiJTP6AmQ2_DD2RDOwV90XgsgOdBhAaiV0jCJJNqRq7Q--kTLGL1MrVE0puxfF561q/exec";

let totalRecordsCount = 0;
let originalRowsData = [];

// Triggers automatically when the GitHub page finishes loading
window.onload = function() {
  fetchDataFromSheets();
};

function fetchDataFromSheets() {
  const loader = document.getElementById('loader');
  
  // Fetch live row streams directly from your deployment endpoint
  fetch(GOOGLE_WEB_APP_URL)
    .then(response => response.json())
    .then(data => {
      renderTable(data);
    })
    .catch(err => {
      loader.innerText = "Error loading live database grid: " + err;
      console.error(err);
    });
}

function renderTable(data) {
  const headerRow = document.getElementById('tableHeader');
  const body = document.getElementById('tableBody');
  
  totalRecordsCount = data.rows.length;
  originalRowsData = data.rows;

  // Clear any structural placeholders
  headerRow.innerHTML = "";
  body.innerHTML = "";

  // Generate Header Columns
  data.headers.forEach(header => {
    let th = document.createElement('th');
    th.innerText = header;
    headerRow.appendChild(th);
  });

  // Array of distinct accent colors to cycle through for each row card
  const rowColors = [
    "#3b82f6", // Blue
    "#10b981", // Emerald Green
    "#f59e0b", // Amber/Orange
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#06b6d4"  // Cyan
  ];

  // Generate Data Core Record Rows as Separate Cards
  data.rows.forEach((row, rowIndex) => {
    let tr = document.createElement('tr');
    tr.className = 'card-row';
    tr.setAttribute('data-index', rowIndex);
    
    // Pick a distinct color based on the row index
    let borderColor = rowColors[rowIndex % rowColors.length];
    tr.style.setProperty('--row-border-color', borderColor);
    
    row.forEach((cell, index) => {
      let td = document.createElement('td');
      
      // If column 2 (index 1) contains a web address link, parse as an interactive button
      if (index === 1 && (String(cell).startsWith('http://') || String(cell).startsWith('https://'))) {
        let a = document.createElement('a');
        a.href = cell;
        a.className = 'btn-download';
        a.innerText = 'Download File';
        a.target = '_blank';
        td.appendChild(a);
      } else {
        td.innerText = cell;
      }
      tr.appendChild(td);
    });
    
    body.appendChild(tr);
  });

  document.getElementById('loader').style.display = 'none';
  document.getElementById('rulesTable').style.display = 'table';
  
  updateCountDisplay(totalRecordsCount, false);
  setupScrollHighlightObserver();
}

// Automatically highlights rows with a smooth effect as they scroll into view
function setupScrollHighlightObserver() {
  const rows = document.querySelectorAll('.card-row');
  const tableContainer = document.querySelector('.table-container');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-highlight');
        // Remove highlight slightly after it enters for a clean fading pulse effect
        setTimeout(() => {
          entry.target.classList.remove('scroll-highlight');
        }, 800);
      }
    }, {
      root: tableContainer,
      threshold: 0.2
    });
  });

  rows.forEach(row => observer.observe(row));
}

function filterTable() {
  const input = document.getElementById('searchInput');
  const filter = input.value.trim();
  const filterLower = filter.toLowerCase();
  const table = document.getElementById('rulesTable');
  const tr = table.getElementsByTagName('tr');
  
  let visibleCount = 0;

  for (let i = 1; i < tr.length; i++) {
    let rowIndex = tr[i].getAttribute('data-index');
    let columns = tr[i].getElementsByTagName('td');
    
    if (columns.length > 0 && rowIndex !== null) {
      let ruleNameText = String(originalRowsData[rowIndex][0]);
      let ruleNameLower = ruleNameText.toLowerCase();
      
      if (ruleNameLower.indexOf(filterLower) > -1) {
        tr[i].style.display = "";
        visibleCount++;
        
        if (filter.length > 0) {
          let regex = new RegExp(`(${escapeRegExp(filter)})`, "gi");
          columns[0].innerHTML = ruleNameText.replace(regex, "<mark class='highlight'>$1</mark>");
        } else {
          columns[0].innerText = ruleNameText;
        }
      } else {
        tr[i].style.display = "none";
      }
    }
  }

  const isFiltered = filter.length > 0;
  updateCountDisplay(visibleCount, isFiltered);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateCountDisplay(count, isFiltered) {
  const badge = document.getElementById('countTracker');
  badge.style.display = 'inline-block';
  
  if (isFiltered) {
    badge.classList.add('filtered');
    badge.innerText = `Found ${count} matching item${count === 1 ? '' : 's'}`;
  } else {
    badge.classList.remove('filtered');
    badge.innerText = `Total items: ${count}`;
  }
}