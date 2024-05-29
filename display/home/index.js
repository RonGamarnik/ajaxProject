const urlBooks = "http://localhost:8001/books";
const showAllBooksDisplay = document.querySelector(".showAllBooks");
const chosenBookDisplay = document.querySelector(".chosenBook");
const paginateButtons = document.querySelector(".paginateButtons");
const searchInput = document.getElementById("searchInput");

let page = 1;
let allBooks = [];
let filteredBooks = [];
let isSearching = false;

function showAllBooks(page) {
  axios
    .get(`${urlBooks}?_page=${page}`)
    .then((response) => {
      const responseData = response.data;
      if (Array.isArray(responseData.data)) {
        const books = responseData.data;
        displayBooks(books);
      } else {
        console.error("Unexpected response structure:", responseData);
      }
    })
    .catch((error) => {
      console.error("Error fetching books:", error);
    });
}

function displayBooks(books) {
  showAllBooksDisplay.innerHTML = "";
  books.forEach((book) => {
    const bookElement = document.createElement("div");
    bookElement.classList.add("book");
    bookElement.setAttribute("data-id", book.id);

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

    bookElement.addEventListener("click", () => chosenBook(book));
    showAllBooksDisplay.appendChild(bookElement);
  });
}

function searchBooks() {
  const searchString = searchInput.value.toLowerCase();
  isSearching = true;
  page = 1; // Reset to first page for search results

  setTimeout(() => {
    axios
      .get(urlBooks)
      .then((response) => {
        if (Array.isArray(response.data)) {
          allBooks = response.data;
          filteredBooks = allBooks.filter(
            (book) =>
              book.bookName &&
              book.bookName.toLowerCase().includes(searchString)
          );
          displayBooks(getPaginatedBooks(filteredBooks, page));
        } else {
          console.error("Unexpected response structure:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
      });
  }, 300);
}

function debounce(func) {
  let timerId;
  return () => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func();
    }, 300);
  };
}
const searchBounce = debounce(searchBooks);
function getPaginatedBooks(books, page) {
  const booksPerPage = 10;
  const start = (page - 1) * booksPerPage;
  const end = start + booksPerPage;
  return books.slice(start, end);
}

function next() {
  page += 1;
  if (isSearching) {
    displayBooks(getPaginatedBooks(filteredBooks, page));
  } else {
    showAllBooks(page);
  }
}

function previous() {
  if (page > 1) {
    page -= 1;
    if (isSearching) {
      displayBooks(getPaginatedBooks(filteredBooks, page));
    } else {
      showAllBooks(page);
    }
  }
}

function chosenBook(book) {
  const header = document.querySelector("header");
  chosenBookDisplay.style.opacity = "1";
  showAllBooksDisplay.style.opacity = "0.2";
  header.style.opacity = "0.2";
  chosenBookDisplay.style.zIndex = "9999";
  paginateButtons.style.opacity = "0.2";

  chosenBookDisplay.innerHTML = `
  <div class="imgAndName">
  <button type="button" class="close" id="close">X</button>  
  <h3 id="name">${book.bookName}</h3>
  <img src="${book.imageLarge}" alt="Book Image" />
  <div class="buttonsUpper">
  <button type="button" class="favorite" id="add-to-favorites">Add to Favorites</button>
  <button type="button" class="delete" id="delete-book">Delete Book</button>
  </div>
  </div>
    <div class="chosenBookData">
    <p><span>Author:</span> ${book.authorsName}</p>
    <p><span>Number of pages:</span> ${book.numPages}</p>
    <p><span>Description:</span> ${book.shortDescription}</p>
    <p><span>Categories:</span> ${book.categories}</p>
    <p><span>Number of copies:</span> ${book.numCopies}</p>
    <p><span>ISBN:</span> ${book.isbn}</p>
    <div class="buttonsForCopies">
    <button id="plus">+</button>
    <button id="minus">-</button>
    </div>
    </div>
    `;
  const closeButton = document.querySelector(".close");
  closeButton.addEventListener("click", () => {
    chosenBookDisplay.style.opacity = "0";
    chosenBookDisplay.style.zIndex = "-1";
    showAllBooksDisplay.style.opacity = "1";
    header.style.opacity = "1";
    paginateButtons.style.opacity = "1";
  });

  // Add event listeners in JavaScript
  document
    .getElementById("add-to-favorites")
    .addEventListener("click", () => addToFavorites(book));
  document
    .getElementById("delete-book")
    .addEventListener("click", () => deleteBookFromLibrary(book));
  document
    .getElementById("plus")
    .addEventListener("click", () => addCopies(book.id));
  document
    .getElementById("minus")
    .addEventListener("click", () => removeCopies(book.id));
}

async function addCopies(bookId) {
  try {
    const response = await axios.get(`${urlBooks}/${bookId}`);
    const bookToUpdate = response.data;
    bookToUpdate.numCopies += 1;
    updateBook(bookToUpdate)
  } catch (error) {
    console.log(error);
  }

}

async function removeCopies(bookId) {
  try {
    const response = await axios.get(`${urlBooks}/${bookId}`);
    const bookToUpdate = response.data;
    bookToUpdate.numCopies -= 1;
    updateBook(bookToUpdate)
  } catch (error) {
    console.log(error);
  }


}

function updateBook(bookToUpdate) {
  axios
    .patch(`${urlBooks}/${bookToUpdate.id}`, bookToUpdate)
    .then((response) => {
      console.log("Book updated:", response.data);
    })
    .catch((error) => {
      console.error("Error updating book:", error);
    });
}

function addToFavorites(book) {
  const favoritesUrl = "http://localhost:8001/favorites";

  // Fetch the current list of favorite books
  axios
    .get(favoritesUrl)
    .then((response) => {
      const favoriteBooks = response.data;

      // Check if the book is already in the favorites list
      const bookExists = favoriteBooks.some(
        (favBook) => favBook.bookName === book.bookName
      );

      if (!bookExists) {
        const favoriteBook = {
          bookName: book.bookName || "No title available",
          authorsName: book.authorsName || "No authors available",
          imageSmall: book.imageSmall || "No image available",
        };

        axios
          .post(favoritesUrl, favoriteBook)
          .then((response) => {
            console.log("Book added to favorites:", response.data);
          })
          .catch((error) => {
            console.error(
              "There was an error adding the book to favorites:",
              error
            );
          });
      } else {
        console.log("Book already exists in favorites");
      }
    })
    .catch((error) => {
      console.error("There was an error fetching the favorites list:", error);
    });
}

function deleteBookFromLibrary(book) {
  axios
    .delete(`${urlBooks}/${book.id}`)
    .then((response) => {
      console.log("Book deleted:", response.data);
      removeBookFromDisplay(book.id);
      addDeleteToHistory(book);
      deleteBookFromFavorite(book.bookName);
    })
    .catch((error) => {
      console.error("Error deleting book:", error);
    });
}

function getCurrentDateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

function addDeleteToHistory(book) {
  const historyUrl = "http://localhost:8001/history";
  const historyBook = {
    bookName: book.bookName || "No title available",
    isbn: book.isbn || "No isbn available",
    action: "Delete",
    date: getCurrentDateTime(),
  };
  axios
    .post(historyUrl, historyBook)
    .then((response) => {
      console.log("Book added to history:", response.data);
    })
    .catch((error) => {
      console.error("There was an error adding the book to history:", error);
    });
}

function removeBookFromDisplay(bookId) {
  const bookElement = document.querySelector(`.book[data-id="${bookId}"]`);
  if (bookElement) {
    bookElement.remove();
  }
}

function deleteBookFromFavorite(bookName) {
  const favoritesUrl = "http://localhost:8001/favorites";

  // Fetch the current list of favorite books
  axios
    .get(favoritesUrl)
    .then((response) => {
      const favoriteBooks = response.data;

      // Find the favorite book with the matching bookName
      const favoriteBook = favoriteBooks.find(
        (favBook) => favBook.bookName === bookName
      );

      if (favoriteBook) {
        // Delete the favorite book using its unique id
        axios
          .delete(`${favoritesUrl}/${favoriteBook.id}`)
          .then((response) => {
            console.log("Book deleted from favorites:", response.data);
          })
          .catch((error) => {
            console.error("Error deleting book from favorites:", error);
          });
      } else {
        console.log("Book not found in favorites");
      }
    })
    .catch((error) => {
      console.error("There was an error fetching the favorites list:", error);
    });
}

showAllBooks(page);
