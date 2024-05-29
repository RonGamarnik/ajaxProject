const API_KEY = "AIzaSyAG2FJV_karWD_hHLYtTbCnAFj79VFbK1g";
const maxResults = 10; // Max results per request
let page = 1;
const paginationContainer = document.querySelector(".pagination");
const booksContainer = document.getElementById("books");
const loader = document.querySelector(".loader");
loader.style.display = "none";
let lastPage = 0;
const urlBooks = "http://localhost:8001/books";

async function fetchBooksFromGoogle(query, page) {
  if (!query) {
    console.error("Missing query.");
    return [];
  }

  const startIndex = (page - 1) * maxResults;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${API_KEY}&startIndex=${startIndex}&maxResults=${maxResults}`;
  try {
    const response = await axios.get(url);
    booksContainer.style.display = "flex";
    return response.data.items || [];
  } catch (error) {
    console.error(
      "Error fetching books from Google Books API:",
      error.response ? error.response.data : error.message
    );
    return [];
  }
}

async function addBookToLocalServer(book) {
  const urlBooks = `http://localhost:8001/books`;
  const newBook = {
    bookName: book.volumeInfo.title || "No title available",
    authorsName: book.volumeInfo.authors
      ? book.volumeInfo.authors.join(", ")
      : "No authors available",
    numPages: book.volumeInfo.pageCount || "No page count available",
    shortDescription: book.volumeInfo.description || "No description available",
    imageSmall: book.volumeInfo.imageLinks
      ? book.volumeInfo.imageLinks.smallThumbnail
      : "No image available",
    imageLarge: book.volumeInfo.imageLinks
      ? book.volumeInfo.imageLinks.thumbnail
      : "No image available",
    categories: book.volumeInfo.categories
      ? book.volumeInfo.categories.join(", ")
      : "No categories available",
    isbn: book.volumeInfo.industryIdentifiers
      ? book.volumeInfo.industryIdentifiers
          .map((id) => id.identifier)
          .join(", ")
      : "No ISBN available",
    numCopies: 5, // Default number of copies
  };

  try {
    const response = await axios.post(urlBooks, newBook);
    console.log("Book added:", response.data);
    addCreateToHistory(newBook); // Pass the newly created book object with correct structure
  } catch (error) {
    console.error(
      "Error adding book to local server:",
      error.response ? error.response.data : error.message
    );
  }
}

async function displayBooks(books) {
  booksContainer.innerHTML = ""; // Clear previous results
  booksContainer.style.opacity = 1;

  const existingBooks = await axios.get("http://localhost:8001/books");
  const existingTitles = existingBooks.data.map((b) => b.bookName);
  booksContainer.style.opacity = 0.2;
  paginationContainer.style.opacity = 0.2;
  loader.style.display = "block";
  books.forEach((book, index) => {
    const title = book.volumeInfo.title || "No title available";
    if (!existingTitles.includes(title)) {
      const bookElement = document.createElement("div");
      bookElement.classList.add("book");

      const authors = book.volumeInfo.authors
        ? book.volumeInfo.authors.join(", ")
        : "No authors available";

      bookElement.innerHTML = `
        <h3>${title}</h3>
        <p><strong>Authors:</strong> ${authors}</p>
        <button id="add-book-${index}" class="add-book-button">Add to Local Library</button>
      `;

      booksContainer.appendChild(bookElement);

      // Add event listener for the button
      document
        .getElementById(`add-book-${index}`)
        .addEventListener("click", () => {
          addBookToLocalServer(book);
        });
    }
  });

  loader.style.display = "none";
  booksContainer.style.opacity = 1;
  paginationContainer.style.opacity = 1;
}

async function fetchAndDisplayBooks() {
  booksContainer.style.opacity = 0.2;
  loader.style.display = "block";
  const searchBookValue = document.getElementById("book-search").value;
  if (!searchBookValue.trim()) {
    console.log("Please enter a search query.");
    loader.style.display = "none"; // Hide loader if no query is entered
    booksContainer.style.opacity = 1;
    return;
  }
  const books = await fetchBooksFromGoogle(searchBookValue, page);
  if (books.length > 0) {
    await displayBooks(books);
  } else {
    console.log("No books found for the given query.");
    loader.style.display = "none"; // Hide loader if no books found
    booksContainer.style.opacity = 1;
    paginationContainer.style.opacity = 1;
  }
}

function debounce(func, timeout = 300) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => func(...args), timeout);
  };
}

const searchWithDebounce = debounce(fetchAndDisplayBooks);

function addCreateToHistory(book) {
  const historyUrl = "http://localhost:8001/history";
  const historyBook = {
    bookName: book.bookName || "No title available",
    isbn: book.isbn || "No ISBN available",
    action: "Create",
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

function getCurrentDateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
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

// Initial fetch and display
fetchAndDisplayBooks();
lastPageCalc();

// Attach event listeners to pagination buttons
const buttonPrevious = document.getElementById("previous");
const buttonNext = document.getElementById("next");

buttonPrevious.addEventListener("click", () => {
  if (page > 1) {
    page -= 1;
    fetchAndDisplayBooks();
  }
});

buttonNext.addEventListener("click", () => {
  if (page < lastPage) {
    page += 1;
    fetchAndDisplayBooks();
  }
});
