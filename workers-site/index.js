// workers-site/index.js
addEventListener("fetch", event => {
    event.respondWith(fetch(event.request));
  });