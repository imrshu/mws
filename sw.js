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
                'img/1.webp',
                'img/2.webp',
                'img/3.webp',
                'img/4.webp',
                'img/5.webp',
                'img/6.webp',
                'img/7.webp',
                'img/8.webp',
                'img/9.webp',
                'img/10.webp'
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
