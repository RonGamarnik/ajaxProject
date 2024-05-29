const historyUrl = "http://localhost:8001/history";
const table = document.querySelector('table');
let page = 1;
lastPage = 0;



async function displayHistory() {
    try {
        const response = await axios.get(`${historyUrl}?_page=${page}`);
        const historyEntries = response.data.data;
        historyEntries.forEach(entry => {
            const bookName = entry.bookName || "undefined";
            const bookIsbn = entry.isbn || "undefined";
            const bookDate = entry.date || "undefined";
            const action = entry.action || "undefined";

            const historyRow = document.createElement("tr");
            historyRow.innerHTML = `<td>${bookName}</td><td>${bookIsbn}</td><td>${bookDate}</td><td>${action}</td>`;
            table.appendChild(historyRow);
            
        });
    } catch (error) {
        console.error("Error fetching history:", error);
    }
}

function nextPage() {
    lastPageCalc();
    console.log(page);
    console.log(lastPage);
    if (page == lastPage) {
        console.log("true");
        return;
    }
    else{
    page++;
    table.textContent = "";
    displayHistory();}
}

function previousPage() {
    if (page == 1) {
        return;
    }
    table.textContent = "";
    page--;
    displayHistory();
}
 async function lastPageCalc() {
    try {
        const response = await axios.get(historyUrl);
        const historyEntries = response.data;
         lastPage = Math.ceil(historyEntries.length / 10);
        console.log(lastPage);
    } catch (error) {
        console.error("Error fetching history:", error);
    }
}
 
lastPageCalc();
displayHistory();
