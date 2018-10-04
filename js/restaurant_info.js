let restaurant;
let map;


/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      // Call createstaticMapImage for create static map
      createstaticMapImage(self.restaurant);
      progressively.init();
      // Set the title of google map iframe tag
      google.maps.event.addListenerOnce(self.map, 'idle', () => {
        document.getElementsByTagName('iframe')[0].title = 'Google Maps';
      });
    }
  });
};


/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  let id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    const dbPromise = IDB.createIndexDB();
    dbPromise.then(db => {
      if (!db) return;
      const tx = db.transaction('restaurant').objectStore('restaurant');
      return tx.get(Number(id)).then(restaurant => {
        if (restaurant) { // Got the restaurant
          self.restaurant = restaurant;
          fillRestaurantHTML();
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      });
    });
  }
};


/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const container = document.getElementById('restaurant-container');
  // Sets the tabindex of restaurant-container
  container.tabIndex = '0';
  // Sets the aria of restaurant-container
  container.setAttribute('aria-label',
   `Details about the ${restaurant.name} Restaurant`);

  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  address.setAttribute('aria-label',
   `Full Address of ${restaurant.name} Restaurant is ${restaurant.address}`);

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img progressive__img progressive--not-loaded';
  image.alt = `${restaurant.name} Restaurant`;
  image.dataset.progressive = DBHelper.imageUrlForRestaurant(restaurant);
  image.src = DBHelper.placeholderIMGUrlForRestaurant();
  progressively.init();

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  cuisine.setAttribute('aria-label',
   `Cuisine of ${restaurant.name} is ${restaurant.cuisine_type}`);

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};


/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];

    // Check if operating hours include ','
    if (operatingHours[key].includes(',')) {
      // Split the time for more accessibility
      let multiple_time = operatingHours[key].split(',');
      let first_time = multiple_time[0].split('-');
      let second_time = multiple_time[1].split('-');
      time.setAttribute('aria-label', `First Shift Is From ${first_time[0]}
       To ${first_time[1]} And Second Shift Is From ${second_time[0]} To
       ${second_time[1]}`);
    } else {
      // Split the time for more accessibility
      let time_split = operatingHours[key].split('-');
      time.setAttribute('aria-label', `From ${time_split[0]} To ${time_split[1]}`);
    }

    row.appendChild(time);
    hours.appendChild(row);
  }
};


/**
 * Get all reviews from the IDB.
 * if and only if they exists
 */
saveReviewsInIDB = (results, dbPromise) => {
  console.log('save ho rhe h bhai');
  // resolve the IDB promise
  dbPromise.then(db => {
    const tx = db.transaction('reviews', 'readwrite').objectStore('reviews');
    results.forEach(review => {
      tx.put(review);
      console.log('fir se get reviews from idb');
    });
  });
};


/**
 * Get all reviews from the server.
 * and save it to the IDB
 */
getReviewsFromServer = (dbPromise) => {
  console.log('server wala function');
  // get the DOM of reviews container
  const container = document.getElementById('reviews-container');
  // get the DOM of reviews section
  const ul = document.getElementById('reviews-list');
  // get the current restaurant id
  const id = getParameterByName('id');
  // restaurant reviews URI
  const review_url = `http://localhost:1337/reviews/?restaurant_id=${id}`;
  // get all restaurant reviews
  fetch(review_url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'same-origin'
  }).then(reviews => {
    if (!reviews) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }
    // parse the results into JSON
    reviews.json().then(results => {
      saveReviewsInIDB(results, dbPromise);
      results.forEach(review => ul.prepend(createReviewHTML(review)));
    });
  });
};

/**
 * Get all reviews from the IDB.
 * if and only if they exists
 */
getReviewsFromIDB = () => {
  console.log('bhai checking ho rhi h');
  // get the DOM of the reviews section
  const ul = document.getElementById('reviews-list');
  // get the current restaurant id
  const id = getParameterByName('id');
  // get the IDB instance
  const dbPromise = IDB.createIndexDB();
  // resolve the IDB promise
  dbPromise.then(db => {
    if (!db) return;
    const tx = db.transaction('reviews').objectStore('reviews').index('restaurant');
    return tx.getAll(Number(id))
    .then(results => {
      if (results.length === 0) getReviewsFromServer(dbPromise);
      results.forEach(review => ul.prepend(createReviewHTML(review)));
    });
  });
};


/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = () => {
  console.log('filling reviews function');
  const container = document.getElementById('reviews-container');
  // Sets the tabIndex of reviews container
  container.tabIndex = '0';
  // Sets the aria of reviews container
  container.setAttribute('aria-label',
  `Reviews about the ${self.restaurant.name} restaurant`);
  console.log('call get reviews from idb');
  // get reviews from IDB
  getReviewsFromIDB();
  // Reviews container header
  const container_header = document.getElementById('reviews-container-header');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container_header.appendChild(title);
};


/**
 * delete review from server
 */
delReviewFromServer = (id) => {
  console.log('aru delete');
  fetch(`http://localhost:1337/reviews/${id}`, {
    method: 'DELETE',
    mode: 'cors',
    credentials: 'same-origin'
  })
  .then(success => {
    webAppStatus('green', `review with ${id} deleted`);
    success.json().then(r=>console.log(r));
  })
  .catch(err => webAppStatus('red', `Server encountered an problem`));
};


/**
 * delete review from the IDB.
 */
delReviewFromIDB = (id) => {
  // get the IDB instance
  const dbPromise = IDB.createIndexDB();
  // resolve the IDB promise
  dbPromise.then(db => {
    if (!db) return;
    db.transaction('reviews', 'readwrite')
    .objectStore('reviews')
    .delete(Number(id))
    .then(succ => {
      webAppStatus('green', `review with ${id} deleted`);
      const review = document.getElementById(id);
      review.parentNode.removeChild(review);
      delReviewFromServer(id);
      // when user comes online again delete review from the server
      // window.addEventListener('online', _ => delReviewFromServer(id));
    });
  });
};


/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.tabIndex = '0';
  li.id = `${review.id}`;

  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.setAttribute('aria-label', `Review By The Customer ${review.name}`);
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = `${reviewsDate(review.createdAt)}`;
  date.setAttribute('aria-label', `On Date ${reviewsDate(review.createdAt)}`);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute('aria-label',
    `${review.name} Gives ${review.rating} Star Rating To This Restaurant`);
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.setAttribute('aria-label', `${review.name} Said ${review.comments}`);
  li.appendChild(comments);

  const delReview = document.createElement('button');
  delReview.innerHTML = 'Remove Review';
  delReview.style.border = 'none';
  delReview.style.padding = '5px 5px';
  delReview.style.backgroundColor = 'green';
  delReview.style.color = 'white';
  delReview.setAttribute('aria-label',
   `Delete this review from ${review.name}`);
  // listener for removing a review
  delReview.addEventListener('click', _ => delReviewFromIDB(review.id));
  li.appendChild(delReview);

  return li;
};


/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');

  // Shortcut for direct access to restaurant details
  const details_li = document.createElement('li');
  const details = document.createElement('a');
  details.innerHTML = `${restaurant.name} Details`;
  details.href = '#restaurant-container';
  details.setAttribute('aria-label',
   `Jump to details section of ${restaurant.name} Restaurant`);
  details_li.appendChild(details);

  // Shortcut for direct access to restaurant reviews
  const reviews_li = document.createElement('li');
  const reviews = document.createElement('a');
  reviews.innerHTML = `${restaurant.name} Reviews`;
  reviews.href = '#reviews-container';
  reviews.setAttribute('aria-label',
   `Jump to reviews section of ${restaurant.name} Restaurant`);
  reviews_li.appendChild(reviews);

  breadcrumb.appendChild(details_li);
  breadcrumb.appendChild(reviews_li);
};


/**
 * Reviews Date Splitting For Accessibility.
 */
reviewsDate = (review_date) => {
  if (typeof(review_date) !== Number){
    const date = new Date(review_date).getTime();
    return new Date(Number(date)).toDateString();
  }
  return new Date(Number(review_date)).toDateString();
};


/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};


/**
 * Generate static map image
 * & place current restaurant
 * marker on the static map.
 */
createstaticMapImage = (restaurant) => {
  // Grab the map container on restaurant info page
  const container = document.getElementById('map-container');
  // Create an image element
  const img = document.createElement('img');
  // Make image focusable
  img.tabIndex = 0;
  // set the class of image
  img.id = 'static-map';
  // set the class of image
  img.className = 'progressive__img progressive--not-loaded';
  // set the alternate text of the image
  img.alt = `${restaurant.name} on the google map`;
  // set the src of image
  img.src = '/img/dist/placeholder.png';
  // set the dataprogessive attr of the image
  // For lazy load the static map image
  img.dataset.progressive = `https://maps.googleapis.com/maps/api/staticmap?
  center=${restaurant.latlng.lat},${restaurant.latlng.lng}
  &zoom=14&size=610x500&format=jpg
  &markers=color:orange|label:${restaurant.name.slice(0,1)}|
  ${restaurant.latlng.lat},${restaurant.latlng.lng}
  &key=AIzaSyAsggoUe5zy3jLXhAo-kYQ8xmgpTi377Ec`;
  // set the aria label attr of image
  img.setAttribute('aria-label',
   `Image of ${restaurant.name} on Google map, However you can click on this image
   to make the image into full interactive google map`);
  // set onclick event on the image
  // For swapping the static map image
  // Into full interactive google map
  img.onclick = () => {
    // Hide the static map image
    img.style.display = 'none';
    // grab the google map area
    let map = document.getElementById('map');
    // show the google map
    map.style.display = 'block';
    // allow focus on google map area
    map.tabIndex = 0;
    // Make force focus on google map
    map.focus();
  };
  // Append the image to the map container
  container.append(img);
};


/**
 * Mark the restaurant as
 * favourite.
 */
markRestFav = () => {
  const localhost = `http://localhost:1337`;
  const id = getParameterByName('id');
  const getRestById = `${localhost}/restaurants/${id}`;

  fetch(getRestById).then(restaurant => {
    restaurant.json().then(rest => {
      (rest.is_favorite.toString() === 'false') ?
      toggleFav(localhost, id, 'true') :
      toggleFav(localhost, id, 'false');
    });
  });
};


/**
 * Toggle restaurant
 * is_favourite property
 * in IDB
 */
toggleIsFavInIDB = (id, state) => {
  const dbPromise = IDB.createIndexDB();
  dbPromise.then(db => {
    db.transaction('restaurant')
    .objectStore('restaurant')
    .get(Number(id))
    .then(rest => {
      rest.is_favorite = state;
      db.transaction('restaurant', 'readwrite')
      .objectStore('restaurant').put(rest);
      console.log('hogya bhai');
    });
  });
};


/**
 * Toggle favourite for
 * favourite.
 */
toggleFav = (url, id, state) => {
  const markFavURL = `${url}/restaurants/${id}/?is_favorite=${state}`;

  fetch(markFavURL, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'same-origin'
  })
  .then(success => {
    toggleIsFavInIDB(id, state);
    webAppStatus('green',
    `Restaurant ${state = (state === 'true') ? 'marked' : 'unmarked'} as favourite`);
 })
  .catch(err => webAppStatus('red', 'server problem'));
};


/**
 * show Feedback Form
 */
showFeedbackForm = () => document.getElementById('reviews-form-container').style.display = 'block'


/**
 * Add form data
 * review to DOM
 */
addReviewHTML = (review) => {
  const ul = document.getElementById('reviews-list');

  const li = document.createElement('li');
  li.tabIndex = '0';

  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.setAttribute('aria-label', `Review By The Customer ${review.name}`);
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = `${reviewsDate(review.createdAt)}`;
  date.setAttribute('aria-label', `On Date ${reviewsDate(review.createdAt)}`);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute('aria-label',
    `${review.name} Gives ${review.rating} Star Rating To This Restaurant`);
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.setAttribute('aria-label', `${review.name} Said ${review.comments}`);
  li.appendChild(comments);

  if (navigator.onLine) {
    li.id = review.id.toString();
    const delReview = document.createElement('button');
    delReview.innerHTML = 'Remove Review';
    delReview.style.border = 'none';
    delReview.style.padding = '5px 5px';
    delReview.style.backgroundColor = 'green';
    delReview.style.color = 'white';
    delReview.setAttribute('aria-label',
     `Delete this review from ${review.name}`);
    // listener for removing a review
    delReview.addEventListener('click', _ => delReviewFromIDB(review.id));
    li.appendChild(delReview);
  } else {
    li.id = 'off-review';
    li.style.border = '1px solid red';
  }

  ul.prepend(li);
};


/**
 * send form data
 * to the server
 */
sendDataToServer = (body, url) => {
  console.log('bhai server wala function');
  console.log(body);
  // fire off ajax request
  fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(body)
  })
  .then(success => {
    console.log('save success');
    success.json().then(result => {
      const dbPromise = IDB.createIndexDB();
      dbPromise.then(db => {
        db.transaction('reviews', 'readwrite')
        .objectStore('reviews').put(result);
      });
      console.log('de');
      console.log(result);
      // add review HTML
      addReviewHTML(result);
      // remove the offline review from DOM
      const review = document.getElementById('off-review');
      review.parentNode.removeChild(review);
    });
    // show the status
    webAppStatus('green', 'Review added successfully');
    // getReviewsFromIDB();
    // getReviewsFromServer(IDB.createIndexDB());
    // reload the page
    // window.location.reload();
  })
  .catch(err => webAppStatus('red', 'Server encountered an problem'));
};


/**
 * Save form data
 * locally in browser
 */
saveDataLocally = (body, url) => {
  // stores the data in localstorage
  localStorage.setItem('review', JSON.stringify(body));
  // render review UI
  addReviewHTML(body);
  // when connection established again
  window.addEventListener('online', () => {
    // get item from localstorage
    const review = JSON.parse(localStorage.getItem('review'));
    // send data back to the server
    sendDataToServer(review, url);
    // delete item from localstorage
    localStorage.removeItem('review');
  });
};


/**
 * add the review
 * according to connection
 */
addReview = (body, url) => {
  // check whether user is offline or online
  if (!navigator.onLine) saveDataLocally(body, url);
  else sendDataToServer(body, url);
};


/**
 * Feedback Form
 * Ajax request
 * to server
 */
feedbackForm = () => {
  event.preventDefault();
  // Create a new restaurant review URI
  const url = `http://localhost:1337/reviews/`;
  // create json body for post method
  let body = {};
  body['restaurant_id'] = Number(getParameterByName('id'));
  body['name'] = document.getElementById('cus_name').value;
  body['rating'] = Number(document.getElementById('rating').value);
  body['comments'] = document.getElementById('comment').value;
  body['createdAt'] = new Date();
  // add the review
  addReview(body, url);
  // reset the form
  document.getElementById('review-form').reset();
  return false;
};
