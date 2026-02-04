import { useState } from 'react';
import { NewsCard } from '../components/UIComponents';

export const PublicHome = ({ data, studentName }) => (
    <div className="space-y-6 animate-in">
        <section className="relative rounded-[2.5rem] overflow-hidden bg-emerald-700 text-white p-10 text-center shadow-xl">
            <div className="absolute inset-0 islamic-pattern opacity-10"></div>
            <h2 className="relative z-10 text-3xl font-black mb-3">{data.texts.heroTitle}</h2>
            <p className="relative z-10 text-sm opacity-90">{data.texts.heroSubtitle}</p>
            {studentName && <div className="relative z-10 mt-4 bg-white/20 px-4 py-2 rounded-full text-xs font-bold inline-block">مرحباً بك يا {studentName} 🌹</div>}
        </section>
        
        <div className="bg-white p-6 rounded-3xl border-r-[10px] border-amber-500 shadow-sm font-bold text-gray-700">
            <h3 className="font-black text-xl mb-2 text-emerald-900">⭐ سؤال الأسبوع</h3>
            <p className="mb-4">{data.texts.weeklyQuestion}</p>
            <button onClick={() => window.open(`https://wa.me/${data.texts.contact.phone}`, '_blank')} className="w-full bg-[#25D366] text-white py-3 rounded-xl flex justify-center items-center gap-2 shadow-lg font-black">
                <span>💬</span> <span>إرسال الإجابة واتساب</span>
            </button>
        </div>

        <section>
            <h2 className="text-2xl font-black text-slate-800 border-b-4 border-amber-400 pb-1 mb-6 inline-block">آخر الأخبار</h2>
            {data.news.filter(n => !n.hidden).map(n => <NewsCard key={n.id} news={n} />)}
        </section>
    </div>
);
// ... يمكنك إضافة مكونات الجداول والمعلمين هنا بنفس طريقة النسخ واللصق من الكود القديم
