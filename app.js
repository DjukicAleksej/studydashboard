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

    const avgs = Object.values(state.subjects)
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
const subjectsContainer = document.getElementById("subjectsContainer");
//Add subjects
addSubjectBtn.addEventListener("click", () => {
    const name = subjectInput.value.trim();
    if(!name) return;
    const key = name.toLowerCase().replace(/\s+/g,"-");
    if(state.subjects[key]){
        alert("Subject already exists!");
        return;
    }

    state.subjects[key] = {name,grades: []};
    saveState();
    renderSubjects();
    renderDashboard();
    subjectInput.value = "";
});

function renderSubjects(){
    if(!subjectsContainer) return;
    subjectsContainer.innerHTML = "";
    Object.keys(state.subjects).forEach(key => {
        const subj = state.subjects[key];

        //create card
        const card = document.createElement("div");
        card.className = "bg-gray-800 p-4 rounded-lg border border-gray-700";

        const title = document.createElement("h3");
        title.textContent = subj.name;
        title.className = "text-lg font-semibold mb-2";

        //avg

        const avg = average(subj.grades).toFixed(2);
        const avgText = document.createElement("p");
        avgText.textContent = `Average: ${isNaN(avg) ? "-" : avg}`;
        avgText.className="mb-2 text-gray-300";

        //Grades list
        const gradesList = document.createElement("div");
        gradesList.className="flex gap-2 flex-wrap mb-2";
        subj.grades.forEach((g,i) => {
            const span = document.createElement("span");
            span.textContent = g;
            span.className = "bg-blue-600 px-2 py-1 rounded cursor-pointer hover:bg-red-600";
            //Click to remove grade
            span.addEventListener("click", () => {
                subj.grades.splice(i,1);
                saveState();
                renderSubjects();
                renderDashboard();
            });
            gradesList.appendChild(span);
        });
        //gr inp
        const gradeInput = document.createElement("input");
        gradeInput.type = "number";
        gradeInput.min = 1;
        gradeInput.max = 5;
        gradeInput.placeholder = "Grade";
        gradeInput.className ="bg-gray-700 border border-gray-600 px-2 py-1 rounded mr-2 w-20";

        const addGradeBtn = document.createElement("button");
        addGradeBtn.textContent = "Add";
        addGradeBtn.className ="bg-green-600 px-3 py-1 rounded hover:bg-green-500";
        addGradeBtn.addEventListener("click", () => {
            const val = parseFloat(gradeInput.value);
            if(!isNaN(val) && val >= 1 && val <= 5){
                subj.grades.push(val);
                saveState();
                renderSubjects();
                renderDashboard();
            }
            gradeInput.value="";
        });

        //del
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete Subject";
        delBtn.className="bg-red-600 px-3 py-1 rounded hover:bg-red mt-2";
        delBtn.addEventListener("click", () => {
            if(confirm(`Delete ${subj.name}?`)) {
                delete state.subjects[key];
                saveState();
                renderSubjects();
                renderDashboard();
            }
        });
        //apnd
        card.appendChild(title);
        card.appendChild(avgText);
        card.appendChild(gradesList);
        card.appendChild(gradeInput);
        card.appendChild(addGradeBtn);
        card.appendChild(delBtn);

        subjectsContainer.appendChild(card);
    });
}

function renderTests(){}
function renderNotes(){}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  setupTabs();
  setToday();
  renderAll();

  // default tab
  document.querySelector('[data-tab="dashboard"]').click();
});
