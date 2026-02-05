// ==========================================
// الملف 2: data_loader.js
// الوظيفة: تحميل ملفات البيانات الخارجية (JSON)
// ==========================================

window.APP_DATA = {
    quran: null,
    pages: null,
    azkar: null,
    isReady: false
};

// دالة لجلب البيانات من الملفات المجاورة
async function loadExternalData() {
    try {
        console.log("جاري تحميل البيانات...");

        // محاولة جلب الملفات الثلاثة في وقت واحد
        const [quranRes, pagesRes, azkarRes] = await Promise.all([
            fetch('quran.json'),
            fetch('pagesquran.json'),
            fetch('azkar.json')
        ]);

        if (!quranRes.ok || !pagesRes.ok || !azkarRes.ok) {
            throw new Error("لم يتم العثور على أحد الملفات");
        }

        // تحويل النصوص إلى كائنات برمجية
        window.APP_DATA.quran = await quranRes.json();
        window.APP_DATA.pages = await pagesRes.json();
        window.APP_DATA.azkar = await azkarRes.json();
        
        window.APP_DATA.isReady = true;
        console.log("تم تحميل كافة البيانات بنجاح ✅");

        // إرسال إشارة للتطبيق بأن البيانات جاهزة
        window.dispatchEvent(new Event('data-loaded'));

    } catch (error) {
        console.error("فشل تحميل البيانات:", error);
        // في حالة الخطأ (مثلاً فتح الملف مباشرة بدون سيرفر)، نعرض تنبيهاً
        document.body.innerHTML += `
            <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);color:white;display:flex;justify-content:center;align-items:center;z-index:9999;text-align:center;direction:rtl;padding:20px;">
                <div>
                    <h2 style="color:#ef4444;font-size:24px;">⚠️ تنبيه هام</h2>
                    <p>المتصفح منع تحميل ملفات البيانات (JSON) لأسباب أمنية لأنك تفتح الملف مباشرة.</p>
                    <p>لتشغيل التطبيق بشكل صحيح، يرجى استخدام إضافة <b>Live Server</b> في VS Code، أو رفع الملفات على استضافة.</p>
                    <button onclick="location.reload()" style="padding:10px 20px;background:#059669;color:white;border:none;border-radius:5px;margin-top:10px;cursor:pointer;">حاول مرة أخرى</button>
                </div>
            </div>
        `;
    }
}

// البدء في التحميل فور تشغيل الملف
loadExternalData();
