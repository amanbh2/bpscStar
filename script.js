let allQuestions = [];
const resultsContainer = document.getElementById("results");
const searchInput = document.getElementById("searchInput");
const examFilter = document.getElementById("examFilter");
const paperFilter = document.getElementById("paperFilter");
const topicFilter = document.getElementById("topicFilter");

async function loadQuestions() {
  try {
    const res = await fetch("data/questions.json");
    if (!res.ok) throw new Error("Failed to load questions.json");

    allQuestions = await res.json();

    populateFilters();
    displayResults(allQuestions);
  } catch (err) {
    resultsContainer.innerHTML = `<p style='color:red;text-align:center;'>⚠️ Error loading questions: ${err.message}</p>`;
    console.error(err);
  }
}

function populateFilters() {
  // Extract unique values
  const exams = [...new Set(allQuestions.map(q => q.exam))].sort().reverse();
  const papers = [...new Set(allQuestions.map(q => q.paper))].sort();
  const topics = [...new Set(allQuestions.map(q => q.topic))].sort();

  // Populate dropdowns
  examFilter.innerHTML = "<option value='All'>All Exams</option>";
  paperFilter.innerHTML = "<option value='All'>All Papers</option>";
  topicFilter.innerHTML = "<option value='All'>All Topics</option>";

  exams.forEach(ex => examFilter.innerHTML += `<option value='${ex}'>${ex}</option>`);
  papers.forEach(p => paperFilter.innerHTML += `<option value='${p}'>${p}</option>`);
  topics.forEach(t => topicFilter.innerHTML += `<option value='${t}'>${t}</option>`);
}

function filterQuestions() {
  const q = searchInput.value.toLowerCase();
  const ef = examFilter.value;
  const pf = paperFilter.value;
  const tf = topicFilter.value;

  const filtered = allQuestions.filter(item => {
    if (ef !== "All" && item.exam !== ef) return false;
    if (pf !== "All" && item.paper !== pf) return false;
    if (tf !== "All" && item.topic !== tf) return false;

    if (!q) return true;

    const haystack = `${item.question} ${item.topic} ${item.subtopic} ${item.tags.join(" ")}`.toLowerCase();
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
      <div class="meta">${q.exam} • ${q.paper}</div>
      <h3>${q.question}</h3>
      <div class="meta">${q.topic} → ${q.subtopic}</div>
      <div class="tags">
        ${q.tags.map(tag => `<span class='tag' data-tag='${tag}'>#${tag}</span>`).join("")}
      </div>
    `;
    resultsContainer.appendChild(card);
  });

  // Enable tag-based quick search
  document.querySelectorAll(".tag").forEach(tagEl => {
    tagEl.addEventListener("click", e => {
      searchInput.value = e.target.dataset.tag;
      filterQuestions();
    });
  });
}

// Event listeners
searchInput.addEventListener("input", filterQuestions);
examFilter.addEventListener("change", filterQuestions);
paperFilter.addEventListener("change", filterQuestions);
topicFilter.addEventListener("change", filterQuestions);

document.getElementById("clearFilters").addEventListener("click", () => {
  searchInput.value = "";
  examFilter.value = "All";
  paperFilter.value = "All";
  topicFilter.value = "All";
  filterQuestions();
});


// Load data on page load
loadQuestions();
