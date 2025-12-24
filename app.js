const STORAGE_KEY = "study-dashboard-data";


let state = {
    subjects:{},
    tests: [],
    notes: {}
};




function setupTabs() {
    const buttons = document.querySelectorAll("[data-tab]");
    const sections = document.querySelectorAll(".tab-section");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.tab;

            sections.forEach(sec => {
                sec.classList.toggle("hidden",sec.id !==target);
            });

            buttons.forEach(b => b.classList.remove("bg-gray-700"));
        });
    });
}


function saveState(){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}
function loadState(){
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) state = JSON.parse(data);
}

/*****************
 * Dashboard
 *****************/


function setToday(){
    const el = document.getElementById("todayDate");
    if(!el) return;

    const today = new Date().toLocaleDateString();
    el.textContent = today
}

function renderAll(){
    renderDashboard();
    renderSubjects();
    renderTests();
    renderNotes();
}

function renderDashboard(){
    const avgEl = document.getElementById("overallAverage");
    const testsEl = document.getElementById("upcomingTests");

    if(!avgEl || !testsEl) return;

    const avgs = Objects.values(state.subjects)
    .map(s=> average(s.grades))
    .filter(v => !isNaN(v))

    const overall = avgs.length
    ? (avgs.reduce((a,b) => a+b,0)/avgs.length).toFixed(2):"-";
    avgEl.textContent = overall;
    const upcoming = state.tests.filter(t=> 
        new Date(t.date) >= new Date()
    );

    testsEl.textContent = upcoming.length;
}

/********************
 * HELPERS
 ********************/
function average(arr){
    if(!arr || arr.length===0) return NaN;
    return arr.reduce((a,b) => a+b,0)/arr.length;
}
/*************
 * Grades Logic
 */
const subjectInput = document.getElementById("subjectInput");
const addSubjectBtn = document.getElementById("addSubjectBtn");
const subjectsContainer = document.getElementById("subjectContainer");


function renderSubjects(){}
function renderTests(){}
function renderNotes(){}

