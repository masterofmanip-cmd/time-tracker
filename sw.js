// Offline support: serve the saved copy instantly, refresh it in the background.
// Only the program files are cached here. Client data never passes through this file.
const CACHE='btt-v3';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const key=req.mode==='navigate'?'./index.html':req;
    const hit=await c.match(key);
    const net=fetch(req).then(r=>{if(r&&r.ok)c.put(key,r.clone());return r;}).catch(()=>null);
    return hit||(await net)||new Response('Offline',{status:503});
  }));
});
