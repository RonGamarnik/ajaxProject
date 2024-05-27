const urlBooks = "http://localhost:8001/books";
const showAllBooksDisplay = document.querySelector(".showAllBooks");
const chosenBookDisplay = document.querySelector(".chosenBook");

let page = 1;
let allBooks = []; // Store all books for easy access

function showAllBooks(page) {
  axios
    .get(`${urlBooks}?_page=${page}`)
    .then((response) => {
      allBooks = response.data.data; // Store the fetched books

      // Clear previous results
      showAllBooksDisplay.innerHTML = "";

      allBooks.forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book");

        // Correctly access book properties
        const imgSrc = book.imageSmall ? book.imageSmall : "default-image.jpg";
        const bookName = book.bookName ? book.bookName : "No title available";
        const authorsName = book.authorsName
          ? book.authorsName
          : "No authors available";

        bookElement.innerHTML = `
          <img src="${imgSrc}" alt="Book Image"/>
          <p>${authorsName}</p>
          <p class="bookName">${bookName}</p>
        `;

        // Correctly add the event listener
        bookElement.addEventListener("click", () => chosenBook(book));

        showAllBooksDisplay.appendChild(bookElement);
      });
    })
    .catch((error) => {
      console.error("Error fetching books:", error);
    });
}

function chosenBook(book) {
  chosenBookDisplay.innerHTML = `
  <div class="imgAndName">
    <h3 id="name">${book.bookName}</h3>
    <img src="${book.imageLarge}" alt="Book Image" />
  </div>
  <div class="chosenBookData">
    <p><span>Author:</span> ${book.authorsName}</p>
    <p><span>Number of pages:</span> ${book.numPages}</p>
    <p><span>Description:</span> ${book.shortDescription}</p>
    <p><span>Categories:</span> ${book.categories}</p>
    <p><span>Number of copies:</span> ${book.numCopies}</p>
    <p><span>ISBN:</span> ${book.isbn}</p>
    <div class="buttonsForCopies">
    <button id="plus" onclick="addCopies(${book.id})">+</button>
    <button onclick="removeCopies(${book.id})">-</button>
    </div>
  </div>
  `;
}

function addCopies(bookId) {
  const book = allBooks.find((b) => b.id === bookId);
  if (book) {
    book.numCopies += 1;
    updateBook(book);
    chosenBook(book);
  }
}

function removeCopies(bookId) {
  const book = allBooks.find((b) => b.id === bookId);
  if (book && book.numCopies > 0) {
    book.numCopies -= 1;
    updateBook(book);
    chosenBook(book);
  }
}

function updateBook(book) {
  axios
    .patch(`${urlBooks}/${book.id}`, book)
    .then((response) => {
      console.log("Book updated:", response.data);
    })
    .catch((error) => {
      console.error("Error updating book:", error);
    });
}

function next() {
  page += 1;
  showAllBooks(page);
}

function previous() {
  if (page > 1) {
    page -= 1;
  }
  showAllBooks(page);
}

showAllBooks(page);
