/* IronLog service worker — rest-timer notifications + offline cache.
   Kept separate from ironlog.html because browsers require service workers
   to be real same-origin JS files (no inline/blob registration). */
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));

// Focus (or reopen) the app when a notification is tapped.
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    for(const c of cs)if('focus' in c)return c.focus();
    return self.clients.openWindow('./ironlog.html');
  }));
});

// Network-first with cache fallback: always fresh while online, and the app
// (plus the Chart.js CDN file) keeps working offline after the first load.
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request).then(r=>{
      const cp=r.clone();
      caches.open('ironlog-v1').then(c=>c.put(e.request,cp)).catch(()=>{});
      return r;
    }).catch(()=>caches.match(e.request).then(m=>m||Response.error()))
  );
});
