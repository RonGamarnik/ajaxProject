document.addEventListener('DOMContentLoaded', (event) => {
    const historyUrl = "http://localhost:8001/history";
    const table = document.querySelector('table');

    function displayHistory() {
        axios.get(historyUrl)
            .then(response => {
                const historyEntries = response.data;

                historyEntries.forEach(entry => {
                    const bookName = entry.bookName || "undefined";
                    const bookIsbn = entry.isbn || "undefined";
                    const bookDate = entry.date || "undefined";
                    const action = entry.action || "undefined";

                    const historyRow = document.createElement("tr");
                    historyRow.innerHTML = `<td>${bookName}</td><td>${bookIsbn}</td><td>${bookDate}</td><td>${action}</td>`;
                    table.appendChild(historyRow);
                });
            })
            .catch(error => {
                console.error("Error fetching history:", error);
            });
    }

    displayHistory();
});
