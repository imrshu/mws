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
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  // Sets the tabIndex of reviews container
  container.tabIndex = '0';
  // Sets the aria of reviews container
  container.setAttribute('aria-label',
  `Reviews about the ${self.restaurant.name} restaurant`);
  // Reviews container header
  const container_header = document.getElementById('reviews-container-header');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container_header.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => ul.appendChild(createReviewHTML(review)));
};


/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.tabIndex = '0';

  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.setAttribute('aria-label', `Review By The Customer ${review.name}`);
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.setAttribute('aria-label', `On Date ${reviewsDate(review.date)}`);
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
  let date = review_date.split(',');
  return date.join(' ');
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
