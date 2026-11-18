const V="br-v20";
const SHELL=["./","index.html","app.css?v=20","app.js?v=20","data/people.js?v=20","data/books.js?v=1","data/books-ot.js?v=1","manifest.webmanifest","icons/icon-192.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin)return;
  const fresh=u.pathname.includes("/data/guide/")||u.pathname.endsWith("/")||u.pathname.endsWith("index.html");
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(e.request);
    const net=fetch(fresh?new Request(e.request,{cache:"no-store"}):e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);
    return fresh?(net.then(r=>r||hit)):(hit||net);
  }));
});
