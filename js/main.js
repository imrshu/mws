let restaurants,
  neighborhoods,
  cuisines;
var map;
var markers = [];



/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
window.onload = () => {
  fetchNeighborhoods();
  fetchCuisines();
  // Cache restaurants in IDB
  cacheContentsInIDB();
  // Render restaurants UI
  updateRestaurants();
};


/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};


/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  // Iterate over neighborhoods to make option
  for (let neighborhood of neighborhoods) {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  }
};


/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};


/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  // Iterate over cuisines to make option
  for (let cuisine of cuisines) {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  }
};


/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  // Set the title of google map iframe tag
  google.maps.event.addListenerOnce(map, 'idle', () => {
    document.getElementsByTagName('iframe')[0].title = 'Google Maps';
  });
};


/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cuisine = document.getElementById('cuisines-select').value;
  const neighborhood = document.getElementById('neighborhoods-select').value;

  const dbPromise = IDB.createIndexDB();
  dbPromise.then(db => {
    if (!db) return;
    const tx = db.transaction('restaurant').objectStore('restaurant');
    return tx.getAll().then(results => {
      let restaurants = results;
      if (cuisine !== 'all') { // filter by cuisine
        restaurants = restaurants.filter(r => r.cuisine_type === cuisine);
      }
      if (neighborhood !== 'all') { // filter by neighborhood
        restaurants = restaurants.filter(r => r.neighborhood === neighborhood);
      }
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    })
  });
};


/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};


/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => ul.append(createRestaurantHTML(restaurant)));
  progressively.init();
  addMarkersToMap();
};


/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img progressive__img progressive--not-loaded';
  image.alt = `${restaurant.name} Restaurant`;
  image.dataset.progressive = DBHelper.imageUrlForRestaurant(restaurant);
  image.src = DBHelper.placeholderIMGUrlForRestaurant();
  li.append(image);

  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.style.whiteSpace = 'nowrap';
  address.style.overflow = 'hidden';
  address.style.textOverflow = 'ellipsis';
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', `View Details of ${restaurant.name} Restaurant`);
  li.append(more);

  return li
};


/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  for (let restaurant of restaurants) {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    marker.addListener('click', () => window.location.href = marker.url);
    self.markers.push(marker);
  }
};


/**
 * Toggle the google map.
 */
showMap = () => {
  let map = document.getElementById('map');
  map.style.display = (map.style.display === 'none') ? 'block' : 'none';
};


/**
 * Put all restaurants in IDB.
 */
cacheContentsInIDB = () => {
  // get the database promise object
  const dbPromise = createIndexDB();
  // Fetch all restaurants from api
  DBHelper.fetchRestaurants((error, restaurants) => {
    // Check if error exists
    if (error) console.log(error);
    // if not error
    dbPromise.then(db => {
      if (!db) return;
      // Initialize the transaction
      const tx = db.transaction('restaurant', 'readwrite');
      // get the objectStore
      const restStore = tx.objectStore('restaurant');
      // iterate over the restaurants array
      // And put restaurants into IDB
      restaurants.forEach(restaurant => restStore.put(restaurant));
    });
  });
};


/**
 * Put all restaurants in IDB.
 */
cacheContentsInIDB = () => {
  // get the database promise object
  const dbPromise = IDB.createIndexDB();
  // Fetch all restaurants from api
  DBHelper.fetchRestaurants((error, restaurants) => {
    // Check if error exists
    if (error) console.log(error);
    // if not error
    dbPromise.then(db => {
      if (!db) return;
      // Initialize the transaction
      const tx = db.transaction('restaurant', 'readwrite');
      // get the objectStore
      const restStore = tx.objectStore('restaurant');
      // iterate over the restaurants array
      // And put restaurants into IDB
      restaurants.forEach(restaurant => restStore.put(restaurant));
    });
  });
};
