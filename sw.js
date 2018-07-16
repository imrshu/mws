// Restaurant reviews Cache name
const CACHE_NAME = 'restaurant_reviews_v1';


/**
 * Service worker install event
 * for initial caching in browser
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                'css/dist/styles.min.css',
                'js/dist/main.min.js',
                'js/dist/restaurant_info.min.js',
                'img/1.jpg',
                'img/2.jpg',
                'img/3.jpg',
                'img/4.jpg',
                'img/5.jpg',
                'img/6.jpg',
                'img/7.jpg',
                'img/8.jpg',
                'img/9.jpg',
                'img/10.jpg'
            ]);
        })
    );
});


/**
 * Service worker activate event
 * for deleting old cache in browser.
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
                .map((cacheName) => caches.delete(cacheName))
            );
        })
    )
});


/**
 * Service worker fetch event
 * for offline page availability
 */
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((resp) => {
            // Return cache response if matches
            // else fetch request from network
            // and put it in cache.
            return resp || caches.open(CACHE_NAME).then((cache) => {
                return fetch(event.request).then((resp) => {
                    // Check if response not found
                    if (resp.status === 404) return new Response('Not Found');
                    cache.put(event.request, resp.clone());
                    return resp;
              });
            })
        })
    );
});
