/* البوابة: الشبكة أولًا دايمًا (عشان الكل ياخد آخر نسخة)، والنسخة المخزنة بتستخدم بس لو مفيش نت.
   الفيديوهات مستبعدة من التخزين عشان متاخدش مساحة من الموبايل. */
var CACHE = "dma-portal-v3";
var CORE = ["./", "index.html", "evaluation.html", "version.json"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE).catch(function(){}); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;
  var url = req.url;
  if(/\.mp4(\?|$)/.test(url) || req.headers.get("range")) return;
  var cacheable = url.indexOf(self.location.origin) === 0 || /cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(url);
  if(!cacheable) return;
  e.respondWith(
    /* ملفات البوابة نفسها: نتحقق من السيرفر كل مرة (no-cache) عشان التعديل يظهر فورًا بدل ما المتصفح يعرض نسخة مخزنة لمدة 10 دقايق */
    fetch(url.indexOf(self.location.origin) === 0 ? new Request(req, {cache: "no-cache"}) : req).then(function(res){
      if(res && (res.ok || res.type === "opaque") && !/version\.json/.test(url)){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copy); });
      }
      return res;
    }).catch(function(){
      return caches.match(req, {ignoreSearch: /version\.json/.test(url)}).then(function(r){ if(r) return r; return req.mode === "navigate" ? caches.match("index.html") : Response.error(); });
    })
  );
});
