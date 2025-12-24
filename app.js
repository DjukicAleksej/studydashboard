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