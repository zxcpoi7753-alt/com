const CACHE_NAME = 'thuraya-v7-stable';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap'
];

// 1. تثبيت التطبيق وحفظ الملفات الأساسية (Install)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching all assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // تفعيل التحديث فوراً
});

// 2. تنظيف الكاش القديم عند التحديث (Activate)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

// 3. استراتيجية العمل: الشبكة أولاً، ثم الكاش (Fetch)
self.addEventListener('fetch', (event) => {
    // نتجاهل طلبات الامتدادات الغريبة لضمان السرعة
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // إذا نجح الاتصال بالنت، نقوم بتحديث النسخة المحفوظة في الكاش
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // إذا انقطع النت، نذهب للكاش
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // إذا لم نجد الملف (مثل الصور الخارجية)، لا نفعل شيئاً (أو نعرض صورة بديلة)
                });
            })
    );
});
