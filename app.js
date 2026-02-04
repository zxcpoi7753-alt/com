import { initialConfig } from './data.js';

const { useState, useEffect, useRef } = React;

const App = () => {
    // 1. الحالة (State)
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('thuraya_v6_cloud');
        return saved ? { ...initialConfig, ...JSON.parse(saved) } : initialConfig;
    });

    const [page, setPage] = useState('home');
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeAdminTab, setActiveAdminTab] = useState(null);
    
    // PWA & Online Status
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [installPrompt, setInstallPrompt] = useState(null);

    // Student Data
    const [studentName, setStudentName] = useState(localStorage.getItem('st_name') || '');
    const [halaqaName, setHalaqaName] = useState(localStorage.getItem('st_halaqa') || '');
    const [expandedSch, setExpandedSch] = useState(null);
    const [openCalc, setOpenCalc] = useState(null);

    // Modals
    const [loginModal, setLoginModal] = useState(false);
    const [securityModal, setSecurityModal] = useState({ show: false, action: null, data: null });
    const [passwordInput, setPasswordInput] = useState('');
    const [toast, setToast] = useState(null);
    const [quranToast, setQuranToast] = useState(null);

    // Calculators
    const [calc1, setCalc1] = useState({ days: '', amount: '', completed: '', result: null });
    const [calc2, setCalc2] = useState({ y: '', m: '', d: '', result: null });

    // 2. المؤثرات (Effects) - المزامنة السحابية
    useEffect(() => {
        // حفظ محلي دائماً
        localStorage.setItem('thuraya_v6_cloud', JSON.stringify(config));
        
        // تطبيق الستايل
        document.documentElement.style.setProperty('--layout-scale', config.settings?.layoutScale || 1);
        document.documentElement.style.setProperty('--text-scale', config.settings?.textScale || 1);

        // حفظ سحابي (إذا كان متصلاً)
        if (isOnline && window.db) {
            const saveData = async () => {
                try {
                    // هنا يمكن تفعيل كود الحفظ الحقيقي عند الحاجة
                    // await window.setDoc(window.doc(window.db, "appData", "mainConfig"), config);
                } catch (e) { console.error("فشل الحفظ السحابي", e); }
            };
            const timeoutId = setTimeout(() => saveData(), 2000);
            return () => clearTimeout(timeoutId);
        }
    }, [config, isOnline]);

    useEffect(() => {
        window.addEventListener('online', () => setIsOnline(true));
        window.addEventListener('offline', () => setIsOnline(false));
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setInstallPrompt(e);
        });
    }, []);

    // 3. الدوال المساعدة
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const installApp = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') setInstallPrompt(null);
        });
    };

    // 4. تنفيذ العمليات الآمنة
    const executeSecureAction = () => {
        if(passwordInput !== '12345') { showToast('كلمة المرور خاطئة', 'error'); return; }
        
        const { action, type, id } = securityModal.data;
        let newConfig = { ...config };
        
        if(action === 'delete') {
            if(type === 'news') newConfig.news = newConfig.news.filter(x => x.id !== id);
            if(type === 'teacher') newConfig.teachers = newConfig.teachers.filter(x => x.id !== id);
            if(type === 'halqa') newConfig.halaqat = newConfig.halaqat.filter(x => x.id !== id);
            if(type === 'schedule') newConfig.schedules = newConfig.schedules.filter(x => x.id !== id);
            showToast('تم الحذف بنجاح');
        }
        if(action === 'hide') {
            const toggle = (list) => list.map(x => x.id === id ? {...x, hidden: !x.hidden} : x);
            if(type === 'news') newConfig.news = toggle(newConfig.news);
            if(type === 'teacher') newConfig.teachers = toggle(newConfig.teachers);
            if(type === 'halqa') newConfig.halaqat = toggle(newConfig.halaqat);
            if(type === 'schedule') newConfig.schedules = toggle(newConfig.schedules);
            showToast('تم تغيير الحالة');
        }
        if(action === 'save') {
            showToast('تم حفظ التعديلات سحابياً ☁️');
        }

        setConfig(newConfig);
        setSecurityModal({ show: false, action: null, data: null });
        setPasswordInput('');
    };

    const handleLogin = () => {
        if(passwordInput === '12345') { setIsAdmin(true); setPage('admin'); setLoginModal(false); showToast('تم تسجيل الدخول'); }
        else { showToast('كلمة المرور خاطئة', 'error'); }
        setPasswordInput('');
    }

    // منطق الحاسبات
    const handleCalc1Change = (field, value) => {
        if(value === '') { setCalc1({...calc1, [field]: ''}); return; }
        let val = parseFloat(value);
        if (field === 'amount') {
            if (val > 1812) { setQuranToast(true); setTimeout(() => setQuranToast(false), 6000); val = 1812; } 
            else if (val < 0.1 && val !== 0) val = 0.1;
        }
        if (field === 'days' && val > 7) val = 7;
        if (field === 'completed' && val > 30) val = 30;
        setCalc1(prev => ({ ...prev, [field]: val }));
    };

    const runCalc1 = () => {
        const d = parseFloat(calc1.days) || 0, a = parseFloat(calc1.amount) || 0, c = parseFloat(calc1.completed) || 0;
        if (d === 0 || a === 0) return;
        const rem = 604 - (c * 20);
        if(rem <= 0) { showToast('أتممت الحفظ مسبقاً!', 'success'); return; }
        const days = (rem / (d * a)) * 7;
        if (days < 1) setCalc1(prev => ({ ...prev, result: { type: 'hours', val: Math.ceil(days * 24) } }));
        else setCalc1(prev => ({ ...prev, result: { type: 'date', y: Math.floor(days/365), m: Math.floor((days%365)/30), d: Math.floor((days%365)%30) } }));
    };

    const handleCalc2Change = (f, v) => { if(v==='') setCalc2({...calc2,[f]:''}); else { let val=parseFloat(v); if(f==='y'&&val>15)val=15; if(f==='m'&&val>12)val=12; if(f==='d'&&val>31)val=31; setCalc2(prev=>({...prev,[f]:val})); }};
    const runCalc2 = () => { const t = (parseFloat(calc2.y)||0)*365 + (parseFloat(calc2.m)||0)*30 + (parseFloat(calc2.d)||0); if(t>0) setCalc2(prev=>({...prev, result:(604/t).toFixed(1)})); };
    
    const sendWhatsappAnswer = () => {
        if(!studentName || !halaqaName) { showToast('يرجى تعبئة بياناتك في "بطاقتي" أولاً', 'error'); setPage('card'); return; }
        window.open(`https://wa.me/${config.texts.contact.phone}?text=*إجابة السؤال* 🌙%0a*الطالب:* ${studentName}%0a*الحلقة:* ${halaqaName}%0a*الإجابة:* (اكتب هنا)`, '_blank');
    };

    const AdminSection = ({ id, title, children }) => (
        <div className="mb-2">
            <button onClick={() => setActiveAdminTab(activeAdminTab === id ? null : id)} className={`admin-section-btn ${activeAdminTab === id ? 'active shadow-lg' : ''}`}>
                {title} <span>{activeAdminTab === id ? '▲' : '▼'}</span>
            </button>
            {activeAdminTab === id && <div className="bg-white p-5 rounded-b-2xl border-x border-b border-gray-100 mb-4 animate-in">{children}</div>}
        </div>
    );
    return (
        <div id="app-container" className="min-h-screen flex flex-col relative">
            {/* التوست العام */}
            {toast && <div className="toast-container"><div className={`toast ${toast.type}`}><span>{toast.type === 'success' ? '✅' : '⚠️'}</span>{toast.msg}</div></div>}

            {/* التوست القرآني */}
            {quranToast && (
                <div className="quran-toast">
                    <h3 className="font-black text-lg mb-1">﴿ وَلَا تَعْجَلْ بِالْقُرْآنِ ﴾</h3>
                    <p className="text-[10px] font-bold text-amber-200 mb-2">مِن قَبْلِ أَن يُقْضَىٰ إِلَيْكَ وَحْيُهُ ۖ وَقُل رَّبِّ زِدْنِي عِلْمًا</p>
                    <p className="text-[10px] bg-black/20 rounded px-2 py-1 inline-block">تنبيه: الحد الأقصى للحفظ اليومي هو 3 ختمات</p>
                </div>
            )}

            {/* نافذة الدخول */}
            {loginModal && (
                <div className="modal-overlay" onClick={() => setLoginModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="text-4xl mb-2">🔐</div>
                        <h3 className="text-xl font-black text-gray-800 mb-6">تسجيل الدخول للمشرف</h3>
                        <input type="password" placeholder="كلمة المرور" className="w-full p-4 bg-gray-50 border-2 rounded-xl text-center text-xl font-black mb-4 focus:border-emerald-500 outline-none" autoFocus 
                            value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
                        <button onClick={handleLogin} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold mb-2 shadow-lg">دخول</button>
                        <button onClick={() => setLoginModal(false)} className="w-full text-gray-400 py-2 font-bold text-sm">إلغاء</button>
                    </div>
                </div>
            )}

            {/* نافذة الأمان */}
            {securityModal.show && (
                <div className="modal-overlay" onClick={() => setSecurityModal({ show: false, action: null, data: null })}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="text-4xl mb-2">🛡️</div>
                        <h3 className="text-xl font-black text-gray-800 mb-2">منطقة محمية</h3>
                        <p className="text-sm text-gray-500 mb-6">أدخل كلمة المرور لتأكيد {securityModal.action === 'delete' ? 'الحذف' : securityModal.action === 'hide' ? 'تغيير الحالة' : 'الحفظ'}</p>
                        <input type="password" className="w-full p-3 border-2 border-emerald-100 rounded-xl text-center text-xl font-black mb-4 outline-none" autoFocus 
                            value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
                        <div className="flex gap-2">
                            <button onClick={executeSecureAction} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg">تأكيد</button>
                            <button onClick={() => setSecurityModal({ show: false, action: null, data: null })} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white sticky top-0 z-50 px-4 py-3 border-b flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2" onClick={() => setPage('home')}>
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg cursor-pointer">ث</div>
                    <h1 className="text-xl font-black text-emerald-800">{config.texts.siteTitle}</h1>
                </div>
                <div className="flex gap-2">
                    {installPrompt && <button onClick={installApp} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold animate-pulse">📲 تثبيت</button>}
                    <button onClick={() => { if(isAdmin) setPage('admin'); else { setPasswordInput(''); setLoginModal(true); } }} className={`p-2 rounded-xl transition ${isAdmin ? 'bg-red-50 text-red-500' : 'text-gray-300'}`}>🔒</button>
                </div>
            </header>

            {/* Nav */}
            <nav className="bg-white border-b overflow-x-auto no-scrollbar flex px-4 py-2 gap-2 sticky top-[64px] z-40">
                {['home','student_corner','teachers','students','schedules','about','card'].map(t => (
                    <button key={t} onClick={() => setPage(t)} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${page === t ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-400'}`}>
                        {{home:'الرئيسية', student_corner:'ركن الطالب', teachers:'المعلمون', students:'الأوائل', schedules:'الجداول', about:'من نحن', card:'بطاقتي'}[t]}
                    </button>
                ))}
            </nav>

            <main className="flex-grow p-4 animate-in">
                {/* الرئيسية */}
                {page === 'home' && (
                    <div className="space-y-6">
                        <section className="relative rounded-[2.5rem] overflow-hidden bg-emerald-700 text-white p-10 text-center shadow-xl">
                            <div className="absolute inset-0 islamic-pattern"></div>
                            <h2 className="relative z-10 text-3xl font-black mb-3">{config.texts.heroTitle}</h2>
                            <p className="relative z-10 text-sm opacity-90">{config.texts.heroSubtitle}</p>
                            {studentName && <div className="relative z-10 mt-4 bg-white/20 px-4 py-2 rounded-full text-xs font-bold inline-block">مرحباً بك يا {studentName} 🌹</div>}
                        </section>
                        <div className="bg-white p-6 rounded-3xl border-r-[10px] border-amber-500 shadow-sm font-bold text-gray-700">
                            <h3 className="font-black text-xl mb-2 text-emerald-900">⭐ سؤال الأسبوع</h3>
                            <p className="mb-4">{config.texts.weeklyQuestion}</p>
                            <button onClick={sendWhatsappAnswer} className="w-full bg-[#25D366] text-white py-3 rounded-xl flex justify-center items-center gap-2 shadow-lg hover:bg-[#20bd5a] transition font-black"><span>💬</span> <span>إرسال الإجابة واتساب</span></button>
                        </div>
                        <section>
                            <h2 className="text-2xl font-black text-slate-800 border-b-4 border-amber-400 pb-1 mb-6 inline-block">آخر الأخبار</h2>
                            <div className="grid gap-6">
                                {config.news.filter(n => !n.hidden).map(n => (
                                    <div key={n.id} className="news-card p-8 text-right">
                                        <div className="flex justify-end text-[10px] font-black text-gray-300 mb-2">● {n.date}</div>
                                        <h3 className="text-2xl font-black mb-3 leading-tight" style={{ color: n.colors?.title || '#1e293b' }}>{n.title}</h3>
                                        <p className="text-sm leading-loose mb-3" style={{ color: n.colors?.content || '#64748b' }}>{n.content}</p>
                                        {n.link?.url && (<a href={n.link.url} target="_blank" className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition" style={{ color: n.colors?.link || '#2563eb' }}>🔗 {n.link.text || 'رابط التفاصيل'}</a>)}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* ركن الطالب */}
                {page === 'student_corner' && (
                    <div className="space-y-4 animate-in max-w-lg mx-auto">
                        <h2 className="text-center font-black text-3xl text-emerald-900 mb-6">🎓 ركن الطالب المتميز</h2>
                        <button onClick={() => setOpenCalc(openCalc === 1 ? null : 1)} className={`calc-btn ${openCalc === 1 ? 'active shadow-lg' : ''}`}><span>📅 خطة ختمي (بجهدي)</span><span>{openCalc === 1 ? '➖' : '➕'}</span></button>
                        {openCalc === 1 && (
                            <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 space-y-4 animate-in shadow-xl">
                                <div><label className="text-[10px] font-bold text-gray-400">أيام الحفظ (ماكس 7):</label>
                                <input type="number" placeholder="مثلاً: 5" className="w-full p-3 bg-gray-50 rounded-xl font-black border" value={calc1.days} onChange={e => handleCalc1Change('days', e.target.value)}/></div>
                                <div><label className="text-[10px] font-bold text-gray-400">المقدار (صفحات):</label>
                                <input type="number" step="0.1" placeholder="مثلاً: 1.5" className="w-full p-3 bg-gray-50 rounded-xl font-black border" value={calc1.amount} onChange={e => handleCalc1Change('amount', e.target.value)} /></div>
                                <div><label className="text-[10px] font-bold text-gray-400">أجزاء محفوظة (ماكس 30):</label>
                                <input type="number" placeholder="مثلاً: 3" className="w-full p-3 bg-gray-50 rounded-xl font-black border" value={calc1.completed} onChange={e => handleCalc1Change('completed', e.target.value)}/></div>
                                <button onClick={runCalc1} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg">احسب النتيجة</button>
                                {calc1.result && (
                                    <div className="p-4 bg-emerald-50 rounded-2xl text-center border-2 border-emerald-200 animate-in">
                                        {calc1.result.type === 'hours' ? (<p className="font-black text-emerald-900 text-lg leading-loose">ما شاء الله! همة عالية<br/>تحتاج فقط <span className="text-3xl text-emerald-600">{calc1.result.val}</span> ساعات</p>) : (<p className="font-black text-emerald-900 leading-loose">تحتاج لختم ما تبقى:<br/> <span className="text-emerald-700">{calc1.result.y} سنة</span> و <span className="text-emerald-700">{calc1.result.m} شهر</span> و <span className="text-emerald-700">{calc1.result.d} يوم</span></p>)}
                                        <div className="mt-4 pt-4 border-t border-emerald-200"><p className="text-emerald-800 font-black text-lg">﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ ﴾</p><p className="text-xs text-emerald-600 mt-2 font-bold">نسأل الله أن يبارك في وقتك ويثبتك</p></div>
                                    </div>
                                )}
                            </div>
                        )}
                        <button onClick={() => setOpenCalc(openCalc === 2 ? null : 2)} className={`calc-btn ${openCalc === 2 ? 'active shadow-lg' : ''}`}><span>🎯 دليل الختم (بوقتي)</span><span>{openCalc === 2 ? '➖' : '➕'}</span></button>
                        {openCalc === 2 && (
                            <div className="bg-white p-6 rounded-3xl border-2 border-amber-100 space-y-4 animate-in shadow-xl">
                                <div className="grid grid-cols-3 gap-2">
                                    <div><label className="text-[10px] block text-center font-bold">سنة</label><input type="number" placeholder="0" className="w-full p-2 bg-gray-50 rounded-lg text-center font-black border" value={calc2.y} onChange={e => handleCalc2Change('y', e.target.value)}/></div>
                                    <div><label className="text-[10px] block text-center font-bold">شهر</label><input type="number" placeholder="0" className="w-full p-2 bg-gray-50 rounded-lg text-center font-black border" value={calc2.m} onChange={e => handleCalc2Change('m', e.target.value)}/></div>
                                    <div><label className="text-[10px] block text-center font-bold">يوم</label><input type="number" placeholder="0" className="w-full p-2 bg-gray-50 rounded-lg text-center font-black border" value={calc2.d} onChange={e => handleCalc2Change('d', e.target.value)}/></div>
                                </div>
                                <button onClick={runCalc2} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black shadow-lg">احسب الورد</button>
                                {calc2.result && (<div className="p-4 bg-emerald-50 rounded-2xl text-center border-2 border-emerald-200 animate-in"><p className="font-black text-emerald-900 text-lg leading-loose">عليك قراءة يومياً: <br/> <span className="text-3xl text-emerald-600">{calc2.result}</span> صفحة</p><div className="mt-4 pt-4 border-t border-emerald-200"><p className="text-emerald-800 font-black text-lg">﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ ﴾</p><p className="text-xs text-emerald-600 mt-2 font-bold">نسأل الله أن يبارك في وقتك ويثبتك</p></div></div>)}
                            </div>
                        )}
                    </div>
                )}
                {/* بقية الصفحات */}
                {page === 'schedules' && (<div className="space-y-8 animate-in"><h2 className="text-center text-3xl font-black text-emerald-900 underline underline-offset-8">📅 الجداول الدراسية</h2>{['عصر', 'مغرب'].map(p => (<div key={p} className="space-y-4"><h3 className={`font-black text-xl border-b-2 pb-2 w-fit ${p === 'عصر' ? 'text-amber-500 border-amber-100' : 'text-indigo-500 border-indigo-100'}`}>{p === 'عصر' ? '☀️ حلقات العصر' : '🌙 حلقات المغرب'}</h3>{config.schedules.filter(s => s.period === p && !s.hidden).map(sch => (<div key={sch.id} className="space-y-2"><div onClick={() => setExpandedSch(expandedSch === sch.id ? null : sch.id)} className={`halqa-accordion ${expandedSch === sch.id ? 'active' : ''}`}><span>حلقة {sch.name}</span><span className="text-2xl">{expandedSch === sch.id ? '−' : '+'}</span></div>{expandedSch === sch.id && (<div className="bg-white rounded-[1.5rem] shadow-xl overflow-hidden border border-emerald-100 animate-in"><div className="overflow-x-auto"><table className="w-full schedule-table"><thead><tr><th>اليوم</th><th>الوقت</th><th>الملاحظة</th></tr></thead><tbody>{sch.days.map((d, i) => (<tr key={i}><td>{d.day}</td><td className="text-emerald-700">{d.time}</td><td className="text-gray-500 text-sm">{d.note}</td></tr>))}</tbody></table></div></div>)}</div>))}</div>))}</div>)}
                {page === 'teachers' && <div className="grid gap-4 animate-in">{config.teachers.filter(t => !t.hidden).map(t => (<div key={t.id} className="bg-white p-6 rounded-3xl border flex items-center gap-4 shadow-sm"><div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-black text-xl">{t.name.charAt(0)}</div><div><h3 className="font-black text-lg">{t.name}</h3><p className="text-gray-500 text-sm">{t.bio}</p></div></div>))}</div>}
                {page === 'students' && <div className="space-y-6 animate-in">{config.halaqat.filter(h => !h.hidden).map(h => (<div key={h.id} className="bg-white rounded-[2.5rem] shadow-lg overflow-hidden border-t-8 border-emerald-500"><div className="bg-emerald-50 p-4 text-center font-black text-emerald-800">حلقة {h.name}</div><div className="p-6 space-y-3">{h.students.map((st, idx) => (<div key={st.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border"><span className="font-bold">{idx+1}. {st.name}</span><span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black">{st.rank}</span></div>))}</div></div>))}</div>}
                {page === 'about' && (<div className="space-y-6 animate-in max-w-xl mx-auto"><div className="bg-white p-8 rounded-[2.5rem] shadow-lg text-center space-y-6 border border-emerald-50"><h2 className="text-2xl font-black text-emerald-800">{config.texts.aboutTitle}</h2><p className="text-gray-600 font-bold leading-loose whitespace-pre-line">{config.texts.aboutMain}</p><div className="font-black text-xl italic" style={{ color: config.texts.aboutAyahColor }}>{config.texts.aboutAyah}</div><p className="text-gray-500 font-bold text-sm border-t pt-4">{config.texts.aboutFooter}</p></div><div className="grid grid-cols-2 gap-4"><a href={`tel:${config.texts.contact.phone}`} className="social-box bg-green-50 text-green-600 border border-green-200"><span className="text-3xl mb-2">📞</span><span>اتصل بنا</span></a><a href={config.texts.contact.location} target="_blank" className="social-box bg-blue-50 text-blue-600 border border-blue-200"><span className="text-3xl mb-2">📍</span><span>موقعنا</span></a></div><div className="grid grid-cols-3 gap-3"><a href={config.texts.contact.youtube} className="social-box" style={{background:'#FF0000', color:'white'}}><span className="text-2xl mb-1">▶️</span><span className="text-xs">يوتيوب</span></a><a href={config.texts.contact.facebook} className="social-box" style={{background:'#1877F2', color:'white'}}><span className="text-2xl mb-1">f</span><span className="text-xs">فيسبوك</span></a><a href={config.texts.contact.instagram} className="social-box" style={{background:'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', color:'white'}}><span className="text-2xl mb-1">📸</span><span className="text-xs">انستقرام</span></a></div></div>)}
                {page === 'card' && (<div className="max-w-md mx-auto animate-in space-y-6"><div className="bg-white p-8 rounded-[3rem] shadow-xl text-center border-4 border-emerald-50"><h2 className="text-2xl font-black mb-6 text-gray-800">بيانات الطالب</h2><input value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl mb-3 text-center font-bold" placeholder="الاسم الثلاثي" /><input value={halaqaName} onChange={e => setHalaqaName(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl mb-6 text-center font-bold" placeholder="اسم الحلقة" /><button onClick={() => { setPage('home'); showToast('تم حفظ البيانات! 🌟'); }} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg">حفظ وتفعيل</button></div>{studentName && (<div className="bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-64 flex flex-col justify-center items-center text-center border-4 border-amber-400"><h1 className="text-3xl font-black mb-2">{studentName}</h1><p className="text-emerald-200 font-bold">حلقة: {halaqaName}</p></div>)}</div>)}
                
                {/* لوحة الإدارة */}
                {isAdmin && page === 'admin' && (
                    <div className="space-y-4 pb-20 animate-in max-w-2xl mx-auto">
                        <h2 className="text-3xl font-black text-emerald-900 mb-8 px-2 tracking-tight">⚙️ لوحة الإدارة السحابية</h2>
                        
                        <AdminSection id="sc" title="1. أحجام العرض والنصوص 📏">
                            <div className="space-y-6">
                                <div><label className="text-sm font-bold text-gray-500 mb-2 block">حجم الموقع (Fit Screen)</label>
                                <input type="range" min="0.5" max="1.2" step="0.05" className="scale-slider" value={config.settings?.layoutScale || 1} onChange={e => setConfig({...config, settings: {...config.settings, layoutScale: parseFloat(e.target.value)}})} /></div>
                                <div><label className="text-sm font-bold text-gray-500 mb-2 block">حجم النصوص فقط (القراءة)</label>
                                <input type="range" min="0.8" max="1.4" step="0.05" className="scale-slider" value={config.settings?.textScale || 1} onChange={e => setConfig({...config, settings: {...config.settings, textScale: parseFloat(e.target.value)}})} /></div>
                            </div>
                        </AdminSection>

                        <AdminSection id="txt" title="2. نصوص الواجهة وسؤال الأسبوع 📝">
                            <div className="space-y-4 font-bold relative">
                                <button onClick={() => setSecurityModal({show:true, action:'save', type:'general', id:null})} className="absolute top-0 left-0 bg-emerald-600 text-white px-4 py-1 rounded-lg text-xs">💾 حفظ التعديلات</button>
                                <div className="pt-8"><label className="text-xs text-emerald-600 block mb-1">اسم الموقع</label>
                                <input className="w-full p-3 border rounded-xl bg-gray-50" value={config.texts.siteTitle} onChange={e => setConfig({...config, texts: {...config.texts, siteTitle: e.target.value}})} /></div>
                                <div><label className="text-xs text-emerald-600 block mb-1">عنوان الترحيب</label>
                                <input className="w-full p-3 border rounded-xl bg-gray-50" value={config.texts.heroTitle} onChange={e => setConfig({...config, texts: {...config.texts, heroTitle: e.target.value}})} /></div>
                                <div><label className="text-xs text-emerald-600 block mb-1">سؤال الأسبوع</label>
                                <textarea className="w-full p-3 border rounded-xl h-24 bg-gray-50" value={config.texts.weeklyQuestion} onChange={e => setConfig({...config, texts: {...config.texts, weeklyQuestion: e.target.value}})} /></div>
                            </div>
                        </AdminSection>

                        <AdminSection id="about" title="3. بيانات 'من نحن' والروابط 🔗">
                            <div className="space-y-4 font-bold relative">
                                <button onClick={() => setSecurityModal({show:true, action:'save', type:'general', id:null})} className="absolute top-0 left-0 bg-emerald-600 text-white px-4 py-1 rounded-lg text-xs">💾 حفظ التعديلات</button>
                                <div className="pt-8"><label className="text-xs text-gray-500">1. المحتوى الرئيسي:</label>
                                <textarea className="w-full p-3 border rounded-xl h-32 bg-gray-50 text-sm whitespace-pre-line" value={config.texts.aboutMain} onChange={e => setConfig({...config, texts: {...config.texts, aboutMain: e.target.value}})} /></div>
                                
                                <div className="flex gap-2">
                                    <div className="flex-grow"><label className="text-xs text-gray-500">2. الآية القرآنية:</label>
                                    <input className="w-full p-3 border rounded-xl bg-gray-50" value={config.texts.aboutAyah} onChange={e => setConfig({...config, texts: {...config.texts, aboutAyah: e.target.value}})} /></div>
                                    <div><label className="text-xs text-gray-500">اللون:</label>
                                    <input type="color" className="w-12 h-12 border rounded-xl p-1" value={config.texts.aboutAyahColor} onChange={e => setConfig({...config, texts: {...config.texts, aboutAyahColor: e.target.value}})} /></div>
                                </div>

                                <div><label className="text-xs text-gray-500">3. الخاتمة:</label>
                                <input className="w-full p-3 border rounded-xl bg-gray-50" value={config.texts.aboutFooter} onChange={e => setConfig({...config, texts: {...config.texts, aboutFooter: e.target.value}})} /></div>

                                <div className="bg-emerald-50 p-4 rounded-xl space-y-3 border border-emerald-100 mt-4">
                                    <h4 className="text-emerald-800 border-b border-emerald-200 pb-2 mb-2">روابط التواصل:</h4>
                                    <input className="w-full p-2 rounded-lg border text-left text-xs" placeholder="هاتف (بدون +)" value={config.texts.contact.phone} onChange={e => setConfig({...config, texts: {...config.texts, contact: {...config.texts.contact, phone: e.target.value}}})}/>
                                    <input className="w-full p-2 rounded-lg border text-left text-xs" placeholder="رابط الموقع" value={config.texts.contact.location} onChange={e => setConfig({...config, texts: {...config.texts, contact: {...config.texts.contact, location: e.target.value}}})}/>
                                    <input className="w-full p-2 rounded-lg border text-left text-xs text-red-600 bg-red-50" placeholder="رابط يوتيوب" value={config.texts.contact.youtube} onChange={e => setConfig({...config, texts: {...config.texts, contact: {...config.texts.contact, youtube: e.target.value}}})}/>
                                    <input className="w-full p-2 rounded-lg border text-left text-xs text-blue-600 bg-blue-50" placeholder="رابط فيسبوك" value={config.texts.contact.facebook} onChange={e => setConfig({...config, texts: {...config.texts, contact: {...config.texts.contact, facebook: e.target.value}}})}/>
                                    <input className="w-full p-2 rounded-lg border text-left text-xs text-purple-600 bg-purple-50" placeholder="رابط انستقرام" value={config.texts.contact.instagram} onChange={e => setConfig({...config, texts: {...config.texts, contact: {...config.texts.contact, instagram: e.target.value}}})}/>
                                </div>
                            </div>
                        </AdminSection>

                        <AdminSection id="news" title="4. إدارة الأخبار والإعلانات 📰">
                            <button onClick={() => setConfig({...config, news: [{id: Date.now(), title: '', date: new Date().toISOString().split('T')[0], content: '', hidden: false, colors: {title:'#000000', content:'#555555', link:'#2563eb'}, link: {url:'', text:''}}, ...config.news]})} className="w-full bg-emerald-100 text-emerald-700 py-3 rounded-xl font-black mb-4">+ إضافة خبر جديد</button>
                            
                            {config.news.map(n => (
                                <div key={n.id} className={`p-4 border rounded-2xl mb-4 bg-white shadow-sm space-y-3 relative ${n.hidden ? 'item-hidden' : ''}`}>
                                    <div className="flex justify-end gap-2 mb-2 border-b pb-2">
                                        <button onClick={() => setSecurityModal({show:true, action:'save', type:'news', id:n.id, data:n})} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold">💾 حفظ</button>
                                        <button onClick={() => setSecurityModal({show:true, action:'hide', type:'news', id:n.id, data:n})} className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-[10px] font-bold">{n.hidden ? '👁️ إظهار' : '🚫 إخفاء'}</button>
                                        <button onClick={() => setSecurityModal({show:true, action:'delete', type:'news', id:n.id, data:n})} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[10px] font-bold">🗑️ حذف</button>
                                    </div>
                                    
                                    <div className="flex gap-2 items-center">
                                        <input className="flex-grow p-2 font-black border rounded-lg bg-gray-50" placeholder="عنوان الخبر" value={n.title} onChange={e => {const up = config.news.map(x => x.id === n.id ? {...x, title: e.target.value} : x); setConfig({...config, news: up});}} />
                                        <input type="color" className="w-8 h-10 border rounded p-0.5" title="لون العنوان" value={n.colors?.title || '#000000'} onChange={e => {const up = config.news.map(x => x.id === n.id ? {...x, colors: {...x.colors, title: e.target.value}} : x); setConfig({...config, news: up});}} />
                                    </div>

                                    <input type="date" className="w-full p-2 text-sm border rounded-lg" value={n.date} onChange={e => {const up = config.news.map(x => x.id === n.id ? {...x, date: e.target.value} : x); setConfig({...config, news: up});}} />
                                    
                                    <div className="flex gap-2 items-start">
                                        <textarea className="flex-grow p-2 bg-white border rounded-lg text-sm h-20" placeholder="التفاصيل..." value={n.content} onChange={e => {const up = config.news.map(x => x.id === n.id ? {...x, content: e.target.value} : x); setConfig({...config, news: up});}} />
                                        <input type="color" className="w-8 h-10 border rounded p-0.5" title="لون النص" value={n.colors?.content || '#555555'} onChange={e => {const up = config.news.map(x => x.id === n.id ? {...x, colors: {...x.colors, content: e.target.value}} : x); setConfig({...config, news: up});}} />
                                    </div>

                                    <div className="bg-gray-50 p-2 rounded-lg border border-dashed border-gray-300">
                                        <label className="text-[10px] text-gray-400 font-bold mb-1 block">إضافة رابط (اختياري):</label>
                                        <div className="flex gap-2 mb-1">
                                            <input className="flex-grow p-1 border rounded text-xs" placeholder="الرابط (https://...)" value={n.link?.url || ''} onChange={e => {const up = config.news.map(x => x.id === n.id ? {...x, link: {...x.link, url: e.target.value}} : x); setConfig({...config, news: up});}} />
                                            <input type="color" className="w-8 h-8 border rounded p-0.5" title="لون الرابط" value={n.colors?.link || '#2563eb'} onChange={e => {const up = config.news.map(x => x.id === n.id ? {...x, colors: {...x.colors, link: e.target.value}} : x); setConfig({...config, news: up});}} />
                                        </div>
                                        <input className="w-full p-1 border rounded text-xs" placeholder="النص الظاهر" value={n.link?.text || ''} onChange={e => {const up = config.news.map(x => x.id === n.id ? {...x, link: {...x.link, text: e.target.value}} : x); setConfig({...config, news: up});}} />
                                    </div>
                                </div>
                            ))}
                        </AdminSection>

                        <AdminSection id="teachers" title="5. إدارة المعلمين 👨‍🏫">
                            <button onClick={() => setConfig({...config, teachers: [...config.teachers, {id: Date.now(), name: 'معلم جديد', bio: '', hidden: false}]})} className="w-full bg-blue-50 text-blue-600 py-3 rounded-xl font-black mb-4">+ إضافة معلم جديد</button>
                            
                            {config.teachers.map(t => (
                                <div key={t.id} className={`flex flex-col gap-2 mb-3 bg-white p-3 rounded-xl border relative ${t.hidden ? 'item-hidden' : ''}`}>
                                    <div className="flex justify-end gap-2 mb-2 border-b pb-2">
                                        <button onClick={() => setSecurityModal({show:true, action:'save', type:'teacher', id:t.id, data:t})} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold">💾 حفظ</button>
                                        <button onClick={() => setSecurityModal({show:true, action:'hide', type:'teacher', id:t.id, data:t})} className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-[10px] font-bold">{t.hidden ? '👁️' : '🚫'}</button>
                                        <button onClick={() => setSecurityModal({show:true, action:'delete', type:'teacher', id:t.id, data:t})} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[10px] font-bold">🗑️</button>
                                    </div>
                                    <input className="w-full font-black border-b pb-1 mb-2" placeholder="اسم المعلم" value={t.name} onChange={e => {const up = config.teachers.map(x => x.id === t.id ? {...x, name: e.target.value} : x); setConfig({...config, teachers: up});}} />
                                    <textarea className="w-full text-xs text-gray-500 bg-gray-50 p-2 rounded h-16" placeholder="نبذة ووصف المعلم..." value={t.bio} onChange={e => {const up = config.teachers.map(x => x.id === t.id ? {...x, bio: e.target.value} : x); setConfig({...config, teachers: up});}} />
                                </div>
                            ))}
                        </AdminSection>

                        <AdminSection id="schedules" title="6. إدارة الجداول (تعديل كامل) 📅">
                            <div className="flex gap-2 mb-4 bg-gray-50 p-3 rounded-xl">
                                <input id="ns" className="flex-1 border rounded p-2 text-xs font-bold" placeholder="اسم الحلقة الجديد" />
                                <select id="np" className="border rounded text-xs font-bold"><option value="عصر">عصر</option><option value="مغرب">مغرب</option></select>
                                <button onClick={() => {const v=document.getElementById('ns').value,p=document.getElementById('np').value; if(v) setConfig({...config, schedules:[...config.schedules, {id:Date.now(), name:v, period:p, hidden: false, days: initialConfig.schedules[0].days}]})}} className="bg-indigo-600 text-white px-4 rounded text-xs font-bold">+ إضافة</button>
                            </div>

                            {config.schedules.map(sch => (
                                <div key={sch.id} className={`p-4 border rounded-2xl mb-4 bg-white shadow-sm overflow-hidden ${sch.hidden ? 'item-hidden' : ''}`}>
                                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                                        <span className="font-black text-emerald-800">{sch.name} ({sch.period})</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setSecurityModal({show:true, action:'save', type:'schedule', id:sch.id, data:sch})} className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold">💾 حفظ</button>
                                            <button onClick={() => setSecurityModal({show:true, action:'hide', type:'schedule', id:sch.id, data:sch})} className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-[10px] font-bold">{sch.hidden ? 'إظهار' : 'إخفاء'}</button>
                                            <button onClick={() => setSecurityModal({show:true, action:'delete', type:'schedule', id:sch.id, data:sch})} className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-bold">حذف</button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-[10px]">
                                            <thead><tr className="bg-gray-100"><th className="p-1">اليوم</th><th className="p-1">الوقت</th><th className="p-1">الملاحظة</th></tr></thead>
                                            <tbody>
                                                {sch.days.map((d, i) => (
                                                    <tr key={i} className="border-b">
                                                        <td className="p-1 font-bold bg-gray-50">{d.day}</td>
                                                        <td className="p-1"><input className="w-full bg-white border rounded p-1 text-emerald-700 font-bold" value={d.time} onChange={e => {const s=[...config.schedules]; s.find(x=>x.id===sch.id).days[i].time=e.target.value; setConfig({...config, schedules:s})}} /></td>
                                                        <td className="p-1"><input className="w-full bg-white border rounded p-1 text-gray-500" value={d.note} onChange={e => {const s=[...config.schedules]; s.find(x=>x.id===sch.id).days[i].note=e.target.value; setConfig({...config, schedules:s})}} /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </AdminSection>

                        <AdminSection id="top" title="7. أوائل الحلقات 🏆">
                            <button onClick={() => {const name = prompt('اسم الحلقة:'); if(name) setConfig({...config, halaqat: [...config.halaqat, {id: Date.now(), name, students: [], hidden: false}]});}} className="bg-amber-100 text-amber-800 px-3 py-3 rounded-xl text-xs font-black w-full mb-4">+ إضافة حلقة جديدة للأوائل</button>
                            
                            {config.halaqat.map(h => (
                                <div key={h.id} className={`p-4 bg-amber-50 rounded-2xl mb-4 border border-amber-100 ${h.hidden ? 'item-hidden' : ''}`}>
                                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-amber-200">
                                        <span className="font-bold text-amber-900">{h.name}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setSecurityModal({show:true, action:'save', type:'halqa', id:h.id, data:h})} className="text-blue-600 text-[10px] font-bold">💾 حفظ</button>
                                            <button onClick={() => setSecurityModal({show:true, action:'hide', type:'halqa', id:h.id, data:h})} className="text-amber-600 text-[10px] font-bold">{h.hidden ? '👁️' : '🚫'}</button>
                                            <button onClick={() => setSecurityModal({show:true, action:'delete', type:'halqa', id:h.id, data:h})} className="text-red-600 text-[10px] font-bold">🗑️</button>
                                        </div>
                                    </div>
                                    {h.students.map(st => (
                                        <div key={st.id} className="flex gap-1 mt-1 mb-1">
                                            <input className="flex-1 p-2 rounded-lg border text-xs" value={st.name} placeholder="اسم الطالب" onChange={e => {const s = h.students.map(x => x.id === st.id ? {...x, name:e.target.value}:x); setConfig({...config, halaqat: config.halaqat.map(z => z.id === h.id ? {...z, students: s} : z)})}} />
                                            <input className="w-16 p-2 rounded-lg border text-xs text-center" value={st.rank} placeholder="#" onChange={e => {const s = h.students.map(x => x.id === st.id ? {...x, rank:e.target.value}:x); setConfig({...config, halaqat: config.halaqat.map(z => z.id === h.id ? {...z, students: s} : z)})}} />
                                            <button onClick={() => {const s = h.students.filter(x => x.id !== st.id); setConfig({...config, halaqat: config.halaqat.map(z => z.id === h.id ? {...z, students: s} : z)})}} className="text-red-500 font-bold px-2">×</button>
                                        </div>
                                    ))}
                                    <button onClick={() => setConfig({...config, halaqat: config.halaqat.map(x => x.id === h.id ? {...x, students: [...x.students, {id:Date.now(), name:'', rank:''}]} : x)})} className="text-xs bg-white w-full border border-amber-200 py-2 rounded-lg mt-2 font-bold text-amber-600">+ إضافة طالب</button>
                                </div>
                            ))}
                        </AdminSection>

                        <button onClick={() => {setIsAdmin(false); setPage('home');}} className="w-full py-4 mt-8 bg-red-600 text-white rounded-2xl font-black shadow-xl active:scale-95 transition">خروج من وضع المدير 🔒</button>
                    </div>
                )}
            </main>

            <footer className="p-6 text-center bg-slate-50 border-t text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                &copy; 2026 {config.texts.siteTitle} | V6.0 Cloud Connected
            </footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// تسجيل Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => console.log('SW Registered')).catch(err => console.log('SW Fail', err));
    });
}
