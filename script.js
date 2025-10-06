// ==================== Starry Background & Moon ====================
const STAR_COUNT = 150; // Number of stars
const starsContainer = document.createElement("div");
starsContainer.id = "starsContainer";
document.body.prepend(starsContainer);

function createStars() {
  starsContainer.innerHTML = ""; // Clear previous stars
  const width = window.innerWidth;
  const height = window.innerHeight;

  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = Math.random() * 2 + 1; // Small to medium stars
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * height}px`;
    star.style.left = `${Math.random() * width}px`;
    star.style.opacity = Math.random();
    starsContainer.appendChild(star);
  }

  // Add moon
  const moon = document.createElement("div");
  moon.id = "moon";
  moon.style.top = `${Math.random() * 100 + 50}px`;
  moon.style.left = `${Math.random() * (width - 100)}px`;
  starsContainer.appendChild(moon);
}

// Initial star creation
createStars();

// Recreate stars on window resize
window.addEventListener("resize", createStars);

// ==================== Question Search & Filter ====================
let allQuestions = [];
const resultsContainer = document.getElementById("results");
const searchInput = document.getElementById("searchInput");
const examFilter = document.getElementById("examFilter");
const paperFilter = document.getElementById("paperFilter");
const topicFilter = document.getElementById("topicFilter");
const filtersCollapse = document.getElementById("filtersCollapse");
const filtersToggle = document.getElementById("filtersToggle");
const toggleIcon = document.getElementById("toggleIcon");

// Toggle filters panel & change icon
filtersToggle.addEventListener("click", () => {
  const isOpen = filtersCollapse.classList.contains("open");
  if (!isOpen) {
    filtersCollapse.classList.add("open");
    toggleIcon.textContent = "reset_settings";
  } else {
    searchInput.value = "";
    examFilter.value = "All";
    paperFilter.value = "All";
    topicFilter.value = "All";
    filterQuestions();
    filtersCollapse.classList.remove("open");
    toggleIcon.textContent = "settings";
  }
});

// Load questions
async function loadQuestions() {
  try {
    const res = await fetch("data/questions.json");
    if (!res.ok) throw new Error("Failed to load questions.json");
    allQuestions = await res.json();
    populateFilters();
    filterQuestions();
  } catch (err) {
    resultsContainer.innerHTML = `<p style='color:red;text-align:center;'>⚠️ Error loading questions: ${err.message}</p>`;
    console.error(err);
  }
}

// Populate dropdowns
function populateFilters() {
  const exams = [...new Set(allQuestions.map(q => q.exam))].sort().reverse();
  const papers = [...new Set(allQuestions.map(q => q.paper))].sort();
  const topics = [...new Set(allQuestions.map(q => q.topic))].sort();

  examFilter.innerHTML = "<option value='All'>All Exams</option>";
  paperFilter.innerHTML = "<option value='All'>All Papers</option>";
  topicFilter.innerHTML = "<option value='All'>All Topics</option>";

  exams.forEach(ex => examFilter.innerHTML += `<option value='${ex}'>${ex}</option>`);
  papers.forEach(p => paperFilter.innerHTML += `<option value='${p}'>${p}</option>`);
  topics.forEach(t => topicFilter.innerHTML += `<option value='${t}'>${t}</option>`);
}

// Filter questions
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

// Display results
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

  document.querySelectorAll(".tag").forEach(tagEl => {
    tagEl.addEventListener("click", e => {
      searchInput.value = e.target.dataset.tag;
      filterQuestions();
      filtersCollapse.classList.remove("open");
      toggleIcon.textContent = "settings";
    });
  });
}

// Event listeners
searchInput.addEventListener("input", filterQuestions);
examFilter.addEventListener("change", filterQuestions);
paperFilter.addEventListener("change", filterQuestions);
topicFilter.addEventListener("change", filterQuestions);

// Load data on page load
loadQuestions();
