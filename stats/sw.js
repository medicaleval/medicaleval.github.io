/* صفحة الإحصاء الشهري: الشبكة أولًا دايمًا (عشان الكل ياخد آخر نسخة)، والنسخة المخزنة بس لو مفيش نت.
   الفيديو مستبعد من التخزين عشان مياخدش مساحة من الموبايل. */
var CACHE = "stat-portal-v1";
var CORE = ["./", "index.html", "monthly-stats.html", "hero.jpg"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE).catch(function(){}); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.filter(function(k){ return k.indexOf("stat-portal-")===0 && k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;
  var url = req.url;
  if(/\.mp4(\?|$)/.test(url) || req.headers.get("range")) return;
  var cacheable = url.indexOf(self.location.origin) === 0 || /fonts\.(googleapis|gstatic)\.com/.test(url);
  if(!cacheable) return;
  e.respondWith(
    (url.indexOf(self.location.origin) === 0 ? fetch(url, {cache: "no-cache", credentials: "same-origin"}) : fetch(req)).then(function(res){
      if(res && (res.ok || res.type === "opaque") && !/version\.json/.test(url)){
        var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); });
      }
      return res;
    }).catch(function(){
      return caches.match(req, {ignoreSearch: /version\.json/.test(url)}).then(function(r){ if(r) return r; return req.mode === "navigate" ? caches.match("index.html") : Response.error(); });
    })
  );
});
