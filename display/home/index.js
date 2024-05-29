const urlBooks = "http://localhost:8001/books";
const showAllBooksDisplay = document.querySelector(".showAllBooks");
const chosenBookDisplay = document.querySelector(".chosenBook");
const searchInput = document.getElementById("searchInput");
const paginateButtons = document.querySelector(".paginateButtons");
const header = document.querySelector("header");
const allBookCard = document.querySelector(".allBooksCard")
let lastPage = 0;

let page = 1;
let allBooks = [];
let filteredBooks = [];
let isSearching = false;

async function showAllBooks(page) {
  try {
    const response = await axios.get(`${urlBooks}?_page=${page}`);
    showAllBooksDisplay.style.display = "none";

    const responseData = response.data;
    if (Array.isArray(responseData.data)) {
      const books = responseData.data;
      displayBooks(books);
      showAllBooksDisplay.style.display = "flex";
    } else {
      console.error("Unexpected response structure:", responseData);
    }
  } catch (error) {
    console.error("Error fetching books:", error);
  }
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

async function searchBooks() {
  const searchString = searchInput.value.toLowerCase();
  isSearching = true;
  page = 1;


  const loader = document.querySelector(".loader");
  loader.style.display = "block";
  allBookCard.style.display = "none";

  try {

    await new Promise((resolve) => setTimeout(resolve, 300));

    const response = await axios.get(urlBooks);

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
  } catch (error) {
    console.error("Error fetching books:", error);
  } finally {

    loader.style.display = "none";
    allBookCard.style.display = "block";
  }
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
  if (page === lastPage) {
    return;
  }
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
  try {
    // Display the chosen book card and adjust opacity for other elements
    chosenBookDisplay.style.opacity = "1";
    chosenBookDisplay.style.display = "block";
    chosenBookDisplay.style.visibility = "visible";
    showAllBooksDisplay.style.opacity = "0.2";
    header.style.opacity = "0.2";
    chosenBookDisplay.style.zIndex = "9999";
    paginateButtons.style.opacity = "0.2";

    // Check if the book is in the favorites list
    const favoritesUrl = "http://localhost:8001/favorites";
    axios.get(favoritesUrl)
      .then((response) => {
        const favoriteBooks = response.data;
        const isFavorite = favoriteBooks.some((favBook) => favBook.id === book.id);

        // Determine the class for the star icon based on whether the book is a favorite
        const starIconClass = isFavorite ? "fa-solid fa-star" : "fa-regular fa-star";

        // Generate the HTML for the chosen book card, including the star icon
        chosenBookDisplay.innerHTML = `
          <i class="fa-regular fa-circle-xmark close"></i>
          <h3 id="name">${book.bookName}</h3>
          <div class="imgAndData">
            <div class="imgAndName">
              <img src="${book.imageLarge}" alt="Book Image" />
              <div class="buttonsUpper">
                <i id="addToFav" class="${starIconClass}"></i>
                <i class="fa-regular fa-trash-can" id="delete"></i> 
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
          </div>
        `;

        // Add event listeners for closing the card and other functionalities
        const closeButton = document.querySelector(".close");
        closeButton.addEventListener("click", close);
        document.getElementById("addToFav").addEventListener("click", () => addToFavorites(book));
        document.getElementById("delete").addEventListener("click", () => deleteBookFromLibrary(book));
        document.getElementById("plus").addEventListener("click", () => addCopies(book.id));
        document.getElementById("minus").addEventListener("click", () => removeCopies(book.id));
      })
      .catch((error) => {
        console.error("Error fetching favorite books:", error);
      });
  } catch (error) {
    console.error("Error in chosenBook function:", error);
  }
}
function close() {
  chosenBookDisplay.style.opacity = "0";
  chosenBookDisplay.style.display = "none";
  chosenBookDisplay.style.visibility = "hidden";
  chosenBookDisplay.style.zIndex = "-1";
  showAllBooksDisplay.style.opacity = "1";
  header.style.opacity = "1";
  paginateButtons.style.opacity = "1";
}

async function addCopies(bookId) {
  try {
    const response = await axios.get(`${urlBooks}/${bookId}`);
    const bookToUpdate = response.data;
    bookToUpdate.numCopies += 1;
    addCopyAddToHistory(bookToUpdate);
    updateBook(bookToUpdate);
  } catch (error) {
    console.log(error);
  }
}
async function removeCopies(bookId) {
  try {
    const response = await axios.get(`${urlBooks}/${bookId}`);
    const bookToUpdate = response.data;
    bookToUpdate.numCopies -= 1;
    reduceCopyAddToHistory(bookToUpdate);
    updateBook(bookToUpdate);
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
  close();

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
          id: book.id,
          bookName: book.bookName || "No title available",
          authorsName: book.authorsName || "No authors available",
          imageSmall: book.imageSmall || "No image available",
        };
        const starIcon = document.getElementById("addToFav");
        starIcon.classList.add("fa-solid");
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
        deleteBookFromFavorite(book.id);
      }
    })
    .catch((error) => {
      console.error("There was an error fetching the favorites list:", error);
    });
}

async function deleteBookFromLibrary(book) {
  try {
    const response = await axios.delete(`${urlBooks}/${book.id}`);
    console.log("Book deleted:", response.data);
    removeBookFromDisplay(book.id);
    addDeleteToHistory(book);
    await deleteBookFromFavorite(book.id);
    close();
  } catch (error) {
    console.error("Error deleting book:", error);
  }
}

function getCurrentDateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
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

async function deleteBookFromFavorite(bookId) {
  const favoritesUrl = "http://localhost:8001/favorites";

  try {
    // Fetch the current list of favorite books
    const response = await axios.get(favoritesUrl);
    const favoriteBooks = response.data;

    // Find the favorite book with the matching ID
    const favoriteBook = favoriteBooks.find(
      (favBook) => favBook.id === bookId
    );

    if (favoriteBook) {
      // Delete the favorite book using its unique ID
      const deleteResponse = await axios.delete(`${favoritesUrl}/${favoriteBook.id}`);
      console.log("Book deleted from favorites:", deleteResponse.data);
    } else {
      console.log("Book not found in favorites");
    }
  } catch (error) {
    console.error("There was an error fetching or deleting the favorite book:", error);
  }
}
async function loaderDisplay(example) {
  const loader = document.querySelector(".loader");

  loader.style.display = "block";
  try {
    await example();
  } finally {
    loader.style.display = "none";
  }
}
function addCopyAddToHistory(book) {
  const historyUrl = "http://localhost:8001/history";
  const historyBook = {
    bookName: book.bookName || "No title available",
    isbn: book.isbn || "No isbn available",
    action: "copy added",
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
} function reduceCopyAddToHistory(book) {
  const historyUrl = "http://localhost:8001/history";
  const historyBook = {
    bookName: book.bookName || "No title available",
    isbn: book.isbn || "No isbn available",
    action: "copy reduced",
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
async function lastPageCalc() {
  try {
    const response = await axios.get(urlBooks);
    const bookEntries = response.data;
    lastPage = Math.ceil(bookEntries.length / 10);
    console.log(lastPage);
  } catch (error) {
    console.error("Error fetching Books:", error);
  }
}


// Usage
loaderDisplay(() => showAllBooks(page));
loaderDisplay(() => searchBooks());
lastPageCalc()
