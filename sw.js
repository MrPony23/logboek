// Logboek – werkt offline. Verhoog VERSION bij elke nieuwe versie (gelijk aan APP_VERSION in index.html).
const VERSION='v5';
const CACHE='logboek-'+VERSION;
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-v3-192.png','./icon-v3-512.png','./icon-v3-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('logboek')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{
  const d=e.data||{};
  if(d.type==='SKIP_WAITING')self.skipWaiting();
  else if(d.type==='VERSION'&&e.ports&&e.ports[0])e.ports[0].postMessage(VERSION);
});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(res=>{if(!res.ok)return caches.match('./index.html').then(hit=>hit||res);const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return res})));
});
