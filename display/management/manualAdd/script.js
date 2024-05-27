const urlBooks = "http://localhost:8001/books";

function formSubmit() {
    let bookName = document.getElementById("book-name").value;
    let authorsName = document.getElementById("authors-name").value;
    let numPages = parseInt(document.getElementById("num-pages").value);
    let shortDescription = document.getElementById("short-description").value;
    let imageSmall = document.getElementById("image-small").value;
    let imageLarge = document.getElementById("image-large").value;
    let categories = document.getElementById("categories").value;
    let isbn = document.getElementById("isbn").value;
    let numCopies = parseInt(document.getElementById("num-copies").value);

    let data = {
        bookName: bookName,
        authorsName: authorsName,
        numPages: numPages,
        shortDescription: shortDescription,
        imageSmall: imageSmall,
        imageLarge: imageLarge,
        categories: categories,
        isbn: isbn,
        numCopies: numCopies
    };

    axios.post(urlBooks, data)
        .then(response => {
            console.log(response.data);
            window.location.href = "/display/home/index.html";
        })
        .catch(error => {
            console.error('Error:', error); // Logging errors if any
        });
}
