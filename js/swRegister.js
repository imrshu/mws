// Register a service worker
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js')
    .then((resp) => console.log('registered'))
    .catch(() => console.log('This Browser does not support service worker'));
}