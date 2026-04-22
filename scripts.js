// variable declaration 

let books = []; // Stores every book object loaded from books.json
let displayedBooks = []; //Stores the books currently being displayed after search/filter/sort

let booksByCategory = new Map(); // Maps category to array of books
let wishlist = new Set(); //Stroes the ISBNs of books the user added to wishlist

//Fetching books.json
fetch("books.json")
  .then(function(response) {
    return response.json();
  }) 
  .then(function (data) {
    books = data; // save all loaded books into the books array

    displayedBooks = [...books]; // initialize with all books

    buildCategoryMap(); // function that buils category Map

    populateCategoryFilter(); // fills category dropdown with options

    setupEventListeners(); // search, filter, sort and wishlist button events

    showCards(displayedBooks); 

    updateWishlistCount(); // updates the count for wishlist

    renderWishlist(); // draws the wishlist box

  })
  .catch(function (error){
    console.log("Error loading books:", error); //try catch 
  });

  // FUNCTIONS

  function buildCategoryMap() {

    booksByCategory.clear();

    //loop through books
    for (let i =0; i < books.length; i++) {
      let book = books[i];

      let category = book.category;

      //default in case category is missing
      if (!category) {
        category = "Unknown";
      }

      //check if category in map else add it
      if (!booksByCategory.has(category)) {
        booksByCategory.set(category, []);
      }

      booksByCategory.get(category).push(book);
    }
  }

  // add the categories to dropdownmenu

  function populateCategoryFilter() {
    const categoryFilter = document.getElementById("category-filter"); 

    categoryFilter.innerHTML = '<option value="All">All Categories</option>';

    let categories = Array.from(booksByCategory.keys()); //turn category names from map into array

    categories.sort();

    //Adding each category to dropdown as element 
    for (let i =0; i < categories.length; i ++) {
      let option = document.createElement("option");

      option.value = categories[i];

      option.textContent = categories[i]; //sets the visible text of the option

      categoryFilter.appendChild(option);
    }
  }

  // Connects page controls to appropriate functions
  
  function setupEventListeners() {
    //run applyFilters when user types in search bar
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", applyFilters);

    //run applyFilters when category or sort selction changes
    const categoryFilter = document.getElementById("category-filter");
    categoryFilter.addEventListener("change", applyFilters);

    const sortSelect = document.getElementById("sort-select");
    sortSelect.addEventListener("change", applyFilters);

    // open or close wishlist panel when wishlist button is clicked
    const wishlistToggle = document.getElementById("wishlist-toggle");
    wishlistToggle.addEventListener("click", function() {
      const wishlistPanel = document.getElementById("wishlist-panel");

      wishlistPanel.classList.toggle("hidden"); //show/hide panel using hidden class
    });


  }

  // function for search, category filtering and sorting

  function applyFilters() {
    // convert user input to lowercase and remove extra spaces
    const searchText = document
      .getElementById("search-input")
      .value.toLowerCase()
      .trim();

    //get the current category
    const selectedCategory = document.getElementById("category-filter").value;

    const selectedSort = document.getElementById("sort-select").value; // likewise get the current sort format

    let result = [];  //array to hold filtered/sorted results

    if (selectedCategory === "All") {
      result = [...books];
    } else {
        let categoryBooks = booksByCategory.get(selectedCategory);

        if (categoryBooks) {
          result = [...categoryBooks];
        } else {
             result = []; //if category does not exist return empty array
        }
    }


    // match tile or author to search
    result = result.filter(function (book) {
      let title = "";
      let author = "";

      if (book.title) {
        title = book.title.toLowerCase(); //convert title to lowercase
      }
      
      if (book.author) {
        author = book.author.toLowerCase(); // author to lowercase
      }

      // keep the book if search text match title or author
      return title.includes(searchText) || author.includes(searchText);


    });

    // Sorting
    // Sorting by year from oldest to newest

    if (selectedSort === "year-asc") {
      result.sort(function (a,b) {
        return (a.publishYear || 0) - (b.publishYear || 0);
      });
        // by year from newest to oldest
    } else if (selectedSort == "year-desc") {
      result.sort(function (a,b) {
        return (b.publishYear || 0) - (a.publishYear || 0);
      });
      // sort by price from cheap to expensive
    } else if (selectedSort == "price-asc") {
      result.sort(function (a,b) {
        return (a.price || 0) - (b.price || 0);
      });
      // from expensive to cheap
    } else if (selectedSort == "price-desc") {
      result.sort(function (a,b) {
        return (b.price || 0) - (a.price || 0);
      });
    }

    // save the final filtered list into displayedBooks
    displayedBooks = result;

    // render the updated cards 
    showCards(displayedBooks);
  }

// Display the books array as cards 

function showCards(bookArray) {
  // get the container of all cards
  const cardContainer = document.getElementById("card-container");

  const templateCard = document.getElementById("template-card");

  if(!templateCard) {
    console.log("Template card not found");
    return;
  }

  // clear old cards to draw new ones
  cardContainer.innerHTML = "";

  for (let i =0; i< bookArray.length; i++) {
    const book = bookArray[i];

    const nextCard = templateCard.cloneNode(true); // make a copy of hidden template card

    nextCard.removeAttribute("id");

    nextCard.style.display = "block"; //make the copied card visible
    editCardContent(nextCard, book); // fill copied card with book data

    cardContainer.appendChild(nextCard);  // add card to page
  }
}


// filling a card with information from one book object

function editCardContent(card, book) {
  const titleElement = card.querySelector("h2");
  titleElement.textContent = book.title || "Untitled";

  const imageElement = card.querySelector("img");
  imageElement.src = book.imageMedium || book.imageSmall || book.imageLarge || "";
  imageElement.alt = (book.title || "Book") + " cover";

  const authorElement = card.querySelector(".author");
  authorElement.textContent = book.author || "Unknown Author";

  
  const priceElement = card.querySelector(".price");

  
  const categoryElement = card.querySelector(".category");

 
  const publisherElement = card.querySelector(".publisher");


  const yearElement = card.querySelector(".year");

  
  const descriptionElement = card.querySelector(".description");

  
  const wishlistButton = card.querySelector(".wishlist-btn");


  // Setting fallbacks in case fields are missing: 

  if (book.price != null) {
    priceElement.textContent = "$" + Number(book.price).toFixed(2);
  } else {
    
    priceElement.textContent = "Price unavailable";
  }

  
  categoryElement.textContent = "Category: " + (book.category || "Unknown");
  publisherElement.textContent = "Publisher: " + (book.publisher || "Unknown");
  yearElement.textContent = "Year: " + (book.publishYear || "Unknown");

  
  descriptionElement.textContent = book.description || "No description available.";

  // wishlist handling
  if (wishlist.has(book.isbn)) {
    wishlistButton.textContent = "♥";
  } else {
    // Otherwise show an empty heart
    wishlistButton.textContent = "♡";
  }


  wishlistButton.onclick = function (event) {
    event.stopPropagation();  // When the heart is clicked, stop the click from affecting parent elements
    toggleWishlist(book);  // and toggle this book in the wishlist
  };


}


// function for adding/ removing from wishlist

function toggleWishlist(book) {
  if (!book.isbn) {
    return; // can't add it if no isbn :(
  }

  if (wishlist.has(book.isbn)) {
    wishlist.delete(book.isbn);
  } else {
    wishlist.add(book.isbn);
  }

  //update the count 
  updateWishlistCount();

  renderWishlist();
  
  showCards(displayedBooks);

}

//This is to update how many books are in the wishlist (count)

function updateWishlistCount() {

  const wishlistCount = document.getElementById("wishlist-count");

  wishlistCount.textContent = wishlist.size;
}

// function to display the saved books in wishlist panel
function renderWishlist() {
  // Gets the wishlist container
  const wishlistItems = document.getElementById("wishlist-items");

  
  wishlistItems.innerHTML = ""; //clear old items

  // Creates an array of books whose ISBN is in the wishlist Set
  let savedBooks = books.filter(function (book) {
    return wishlist.has(book.isbn);
  });

  // If nothing is saved, show a message and stop
  if (savedBooks.length === 0) {
    wishlistItems.innerHTML = "<p>No books saved yet.</p>";
    return;
  }

  // Loops through each saved book
  for (let i = 0; i < savedBooks.length; i++) {
  
    let book = savedBooks[i];

    let item = document.createElement("div");

    
    item.className = "wishlist-item";

    let priceText = "Price unavailable";

   
    if (book.price != null) {
      priceText = "$" + Number(book.price).toFixed(2);
    }

   
    item.innerHTML =
      "<strong>" +
      (book.title || "Untitled") +
      "</strong><br>" +
      (book.author || "Unknown Author") +
      "<br>" +
      priceText;

    // Adds the wishlist item to the panel
    wishlistItems.appendChild(item);
  }
}


































// /**
//  * Data Catalog Project Starter Code - SEA Stage 2
//  *
//  * This file is where you should be doing most of your work. You should
//  * also make changes to the HTML and CSS files, but we want you to prioritize
//  * demonstrating your understanding of data structures, and you'll do that
//  * with the JavaScript code you write in this file.
//  *
//  * The comments in this file are only to help you learn how the starter code
//  * works. The instructions for the project are in the README. That said, here
//  * are the three things you should do first to learn about the starter code:
//  * - 1 - Change something small in index.html or style.css, then reload your
//  *    browser and make sure you can see that change.
//  * - 2 - On your browser, right click anywhere on the page and select
//  *    "Inspect" to open the browser developer tools. Then, go to the "console"
//  *    tab in the new window that opened up. This console is where you will see
//  *    JavaScript errors and logs, which is extremely helpful for debugging.
//  *    (These instructions assume you're using Chrome, opening developer tools
//  *    may be different on other browsers. We suggest using Chrome.)
//  * - 3 - Add another string to the titles array a few lines down. Reload your
//  *    browser and observe what happens. You should see a fourth "card" appear
//  *    with the string you added to the array, but a broken image.
//  *
//  */

// const FRESH_PRINCE_URL =
//   "https://upload.wikimedia.org/wikipedia/en/3/33/Fresh_Prince_S1_DVD.jpg";
// const CURB_POSTER_URL =
//   "https://m.media-amazon.com/images/M/MV5BZDY1ZGM4OGItMWMyNS00MDAyLWE2Y2MtZTFhMTU0MGI5ZDFlXkEyXkFqcGdeQXVyMDc5ODIzMw@@._V1_FMjpg_UX1000_.jpg";
// const EAST_LOS_HIGH_POSTER_URL =
//   "https://static.wikia.nocookie.net/hulu/images/6/64/East_Los_High.jpg";

// // This is an array of strings (TV show titles)
// let titles = [
//   "Fresh Prince of Bel Air",
//   "Curb Your Enthusiasm",
//   "East Los High",
// ];
// // Your final submission should have much more data than this, and
// // you should use more than just an array of strings to store it all.

// // This function adds cards the page to display the data in the array
// function showCards() {
//   const cardContainer = document.getElementById("card-container");
//   cardContainer.innerHTML = "";
//   const templateCard = document.querySelector(".card");

//   for (let i = 0; i < titles.length; i++) {
//     let title = titles[i];

//     // This part of the code doesn't scale very well! After you add your
//     // own data, you'll need to do something totally different here.
//     let imageURL = "";
//     if (i == 0) {
//       imageURL = FRESH_PRINCE_URL;
//     } else if (i == 1) {
//       imageURL = CURB_POSTER_URL;
//     } else if (i == 2) {
//       imageURL = EAST_LOS_HIGH_POSTER_URL;
//     }

//     const nextCard = templateCard.cloneNode(true); // Copy the template card
//     editCardContent(nextCard, title, imageURL); // Edit title and image
//     cardContainer.appendChild(nextCard); // Add new card to the container
//   }
// }

// function editCardContent(card, newTitle, newImageURL) {
//   card.style.display = "block";

//   const cardHeader = card.querySelector("h2");
//   cardHeader.textContent = newTitle;

//   const cardImage = card.querySelector("img");
//   cardImage.src = newImageURL;
//   cardImage.alt = newTitle + " Poster";

//   // You can use console.log to help you debug!
//   // View the output by right clicking on your website,
//   // select "Inspect", then click on the "Console" tab
//   console.log("new card:", newTitle, "- html: ", card);
// }

// // This calls the addCards() function when the page is first loaded
// document.addEventListener("DOMContentLoaded", showCards);

// function quoteAlert() {
//   console.log("Button Clicked!");
//   alert(
//     "I guess I can kiss heaven goodbye, because it got to be a sin to look this good!",
//   );
// }

// function removeLastCard() {
//   titles.pop(); // Remove last item in titles array
//   showCards(); // Call showCards again to refresh
// }
