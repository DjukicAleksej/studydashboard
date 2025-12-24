const STORAGE_KEY = "study-dashboard-data";


let state = {
    subjects:{},
    tests: [],
    notes: {}
};

function daysUntil(dateStr){
    const today = new Date();
    const target = new Date(dateStr);
    
    today.setHours(0,0,0,0);
    target.setHours(0,0,0,0);


    return Math.ceil((target-today) / (1000* 60 * 60 * 24));
}




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
    const upcoming = state.tests.filter(t=>{
        const d = daysUntil(t.date);
        return d >= 0 && d <= 7;
});

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
const testSubject = document.getElementById("testSubject");
const testTitle = document.getElementById("testTitle");
const testDate = document.getElementById("testDate");
const addTestBtn = document.getElementById("addTestBtn");
const testsList = document.getElementById("testsList");
if (addTestBtn) {
    addTestBtn.addEventListener("click" , () => {
        if(!testSubject.value || !testTitle.value || !testDate.value) return;
        state.tests.push({
            id: Date.now(),
            subject: testSubject.value.trim(),
            title: testTitle.value.trim(),
            date: testDate.value
        });

        saveState();
        renderTests();
        renderDashboard();

        testSubject.value = "";
        testTitle.value = "";
        testDate.value = "";
    });
}
function renderTests(){
    if(!testsList) return;

    testsList.innerHTML ="";

    const sorted = [...state.tests].sort(
        (a,b) => new Date(a.date) - new Date(b.date)
    );

    sorted.forEach(test => {
        const daysLeft = daysUntil(test.date);
        const isPast = daysLeft < 0;
        const isUrgent = daysLeft >= 0 && daysLeft <= 7;
       

        const card = document.createElement("div");
        card.className =`
  bg-gray-800 border rounded-lg p-4 flex justify-between items-center transition
  ${isUrgent ? "border-red-500 bg-red-950/30" : "border-gray-700"}
`;
        const info = document.createElement("div");
        const badge = document.createElement("span");

        if(isPast){
            badge.textContent = "Passed";
            badge.className ="text-xs text-gray-400";
        } else if(isUrgent){
            badge.textContent = `URGENT • ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
            badge.className=
            "text-xs font-semibold text-red-400 bg-red-900/40 px-2 py-1 rounded";
        } else {
            badge.textContent = `${daysLeft} days left`;
            badge.className =
            "text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded";
        }
        

        const title = document.createElement("p");
        title.className = "font-semibold";
        title.textContent = `${test.subject} - ${test.title}`;

        const date = document.createElement("p");
        date.className=`text-sm ${isPast ? "text-red-400" : "text-green-400"}`;
        date.textContent = test.date;

        info.appendChild(title);
        info.appendChild(date);
        info.appendChild(badge);

        const del = document.createElement("button");
        del.innerHTML=`
<svg xmlns="http://www.w3.org/2000/svg"
     width="32"
     height="32"
     fill="currentColor"
     viewBox="0 0 16 16">
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
</svg>
`;
        del.className= "p-2 rounded-full hover:bg-gray-700 transition text-gray-400 hover:text-red-400";
        del.addEventListener("click", () => {
            state.tests = state.tests.filter(t=> t.id !== test.id);
            saveState();
            renderTests();
            renderDashboard();
        });

        card.appendChild(info);
        card.appendChild(del);

        testsList.appendChild(card);


    });
}
const noteDate = document.getElementById("noteDate");
const noteText = document.getElementById("noteText");
const todayBtn = document.getElementById("todayBtn");
const notesList = document.getElementById("notesList");

if(todayBtn){
    todayBtn.addEventListener("click",() => {
        const today = new Date().toISOString().split("T")[0];
        noteDate.value = today;
        loadNote(); //bilj za dat
    });
}
if(noteText){
    noteText.addEventListener("input",() => {
        const date = noteDate.value;
        if(!date) return;
        state.notes[date] = noteText.value;
        saveState();
        renderNotes();
    });
}
function loadNote(){
    const date = noteDate.value;
    if(!date) return;
    noteText.value = state.notes[date] || "";
}


function renderNotes(){
    if(!notesList) return;
    notesList.innerHTML="";

    const sortedDates = Object.keys(state.notes).sort((a,b) => new Date(b) - new Date(a));

    sortedDates.forEach(d => {
        const div = document.createElement("div");
        div.className = "bg-gray-800 border-gray-700 rounded-lg p-3";

        const dateP = document.createElement("p");
        dateP.className = "text-sm text-gray-400 mb-1";
        dateP.textContent = d;

        const contentP = document.createElement("p");
        contentP.className = "text-gray-100";
        contentP.textContent = state.notes[d];

        div.appendChild(dateP);
        div.appendChild(contentP);

        notesList.appendChild(div);
    });
}

//load note for the actively chosen date
function loadCurrentNote(){
    if(noteDate) loadNote();
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  setupTabs();
  setToday();
  renderAll();

  // default tab
  document.querySelector('[data-tab="dashboard"]').click();
});
