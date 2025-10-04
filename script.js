let allQuestions = [];
const resultsContainer = document.getElementById("results");
const searchInput = document.getElementById("searchInput");
const yearFilter = document.getElementById("yearFilter");
const paperFilter = document.getElementById("paperFilter");
const topicFilter = document.getElementById("topicFilter");

async function loadQuestions() {
  const res = await fetch("data/questions.json");
  allQuestions = await res.json();
  populateFilters();
  displayResults(allQuestions);
}

function populateFilters() {
  const years = [...new Set(allQuestions.map(q => q.year))].sort((a,b)=>b-a);
  const papers = [...new Set(allQuestions.map(q => q.paper))].sort();
  const topics = [...new Set(allQuestions.map(q => q.topic))].sort();

  years.forEach(y => yearFilter.innerHTML += `<option value='${y}'>${y}</option>`);
  papers.forEach(p => paperFilter.innerHTML += `<option value='${p}'>${p}</option>`);
  topics.forEach(t => topicFilter.innerHTML += `<option value='${t}'>${t}</option>`);
}

function filterQuestions() {
  const q = searchInput.value.toLowerCase();
  const yf = yearFilter.value;
  const pf = paperFilter.value;
  const tf = topicFilter.value;

  const filtered = allQuestions.filter(item => {
    if (yf !== "All" && String(item.year) !== yf) return false;
    if (pf !== "All" && item.paper !== pf) return false;
    if (tf !== "All" && item.topic !== tf) return false;

    if (!q) return true;
    const haystack = `${item.text} ${item.subtopic} ${item.tags.join(" ")}`.toLowerCase();
    return haystack.includes(q);
  });

  displayResults(filtered);
}

function displayResults(list) {
  resultsContainer.innerHTML = "";
  if (list.length === 0) {
    resultsContainer.innerHTML = `<p style='text-align:center;color:#555;'>No matching questions found.</p>`;
    return;
  }

  list.forEach(q => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="meta">${q.year} • ${q.paper} • ${q.type} • ${q.marks} marks</div>
      <h3>${q.text}</h3>
      <div class="meta">${q.topic} → ${q.subtopic}</div>
      <div class="tags">
        ${q.tags.map(tag => `<span class='tag' data-tag='${tag}'>#${tag}</span>`).join("")}
      </div>
    `;
    resultsContainer.appendChild(card);
  });

  document.querySelectorAll(".tag").forEach(tagEl => {
    tagEl.addEventListener("click", e => {
      searchInput.value = e.target.dataset.tag;
      filterQuestions();
    });
  });
}

searchInput.addEventListener("input", filterQuestions);
yearFilter.addEventListener("change", filterQuestions);
paperFilter.addEventListener("change", filterQuestions);
topicFilter.addEventListener("change", filterQuestions);

loadQuestions();
