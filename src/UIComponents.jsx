import React from 'react';

// الهيدر الأصلي
export const Header = ({ title, onAdminClick, isAdmin }) => (
    <header className="bg-white sticky top-0 z-50 px-4 py-3 border-b flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">ث</div>
            <h1 className="text-xl font-black text-emerald-800">{title}</h1>
        </div>
        <button onClick={onAdminClick} className={`p-2 rounded-xl transition ${isAdmin ? 'bg-red-50 text-red-500' : 'text-gray-300'}`}>
            {isAdmin ? '🔒 خروج' : '⚙️'}
        </button>
    </header>
);

// التوست (الإشعارات)
export const Toast = ({ msg, type }) => (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce-up">
        <div className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white shadow-lg ${type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
            <span>{type === 'success' ? '✅' : '⚠️'}</span> {msg}
        </div>
    </div>
);

// بطاقة الخبر (نفس الستايل القديم)
export const NewsCard = ({ news }) => (
    <div className="news-card p-8 text-right mb-6 relative">
        <div className="flex justify-end text-[10px] font-black text-gray-300 mb-2">● {news.date}</div>
        <h3 className="text-2xl font-black mb-3 leading-tight" style={{ color: news.colors?.title }}>{news.title}</h3>
        <p className="text-sm leading-loose mb-3" style={{ color: news.colors?.content }}>{news.content}</p>
        {news.link?.url && (
            <a href={news.link.url} target="_blank" className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition" style={{ color: news.colors?.link }}>
                🔗 {news.link.text || 'رابط التفاصيل'}
            </a>
        )}
    </div>
);
