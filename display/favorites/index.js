const favoritesUrl = "http://localhost:8001/favorites";
const favoritesDisplay = document.querySelector(".favorites");

function getFavorites() {
    axios.get(favoritesUrl)
        .then(function (response) {
            // Clear previous results
            favoritesDisplay.innerHTML = "";

            // Iterate over each book in the response data
            response.data.forEach(book => {
                let favoriteBook = document.createElement("div");
                favoriteBook.classList.add("favoriteBook");

                const bookName = book.bookName || "No title available";
                const imgSrc = book.imageSmall || "default-image.jpg";
                const author = book.authorsName || "No authors available";

                favoriteBook.innerHTML = `
          <img src="${imgSrc}" alt="Book Image"/>
          <h3>${bookName}</h3>
          <p>${author}</p>
        `;

                favoritesDisplay.appendChild(favoriteBook);
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}

getFavorites();
