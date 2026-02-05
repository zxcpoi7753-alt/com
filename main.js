// ==========================================
// الملف 4: main.js (العقل المدبر)
// يحتوي على: منطق التطبيق، لوحة التحكم، والربط
// ==========================================

const { useState, useEffect, useRef } = React;

// استيراد المكونات التي أنشأناها في student_features.js
const TestHifz = window.TestHifz;
const QuranReader = window.QuranReader;
const AzkarApp = window.AzkarApp;

// --- مكون قسم الأدمن (مستقل لحل مشكلة الكيبورد) ---
const AdminSection = ({ id, title, children, activeTab, setActiveTab }) => (
    <div className="mb-2">
        <button onClick={() => setActiveTab(activeTab === id ? null : id)} className={`admin-section-btn ${activeTab === id ? 'active shadow-lg' : ''}`}>
            {title} <span>{activeTab === id ? '▲' : '▼'}</span>
        </button>
        {activeTab === id && <div className="bg-white p-5 rounded-b-2xl border-x border-b border-gray-100 mb-4 animate-in">{children}</div>}
    </div>
);

// --- البيانات الافتراضية ---
const initialConfig = {
    settings: { layoutScale: 1, textScale: 1 },
    texts: {
        siteTitle: 'حلقات الثريا',
        heroTitle: 'أهلاً بكم في حلقات الثريا',
        heroSubtitle: 'بيئة تربوية جاذبة لتعليم القرآن الكريم',
        weeklyQuestion: 'من هو الصحابي الذي اهتز لموته عرش الرحمن؟',
        aboutMain: 'نحن حلقات الثريا لتحفيظ القرآن الكريم..',
        aboutAyah: '﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾',
        aboutAyahColor: '#059669',
        aboutFooter: 'ومن القرآن... نبدأ، وبه... نرتقي.',
        studentMsg: 'أخي الطالب: اجعل القرآن ربيع قلبك ونور صدرك.',
        contact: { phone: '', location: '', youtube: '', facebook: '', instagram: '' }
    },
    news: [], teachers: [], halaqat: [], schedules: []
};

const App = () => {
    // --- الحالات (State) ---
    const [config, setConfig] = useState(initialConfig);
    const [page, setPage] = useState('home');
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeAdminTab, setActiveAdminTab] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    // بيانات الطالب
    const [studentName, setStudentName] = useState(localStorage.getItem('st_name') || '');
    const [halaqaName, setHalaqaName] = useState(localStorage.getItem('st_halaqa') || '');
    
    // تحكم الميزات الجديدة
    const [activeFeature, setActiveFeature] = useState(null); // 'test', 'quran', 'azkar', 'calc'
    
    // تحكم الواجهة
    const [expandedSch, setExpandedSch] = useState(null);
    const [loginModal, setLoginModal] = useState(false);
    const [securityModal, setSecurityModal] = useState({ show: false, action: null, data: null });
    const [passwordInput, setPasswordInput] = useState('');
    const [toast, setToast] = useState(null);
    const [dataReady, setDataReady] = useState(false);

    // حاسبات
    const [calc1, setCalc1] = useState({ days: '', amount: '', completed: '', result: null });
    const [calc2, setCalc2] = useState({ y: '', m: '', d: '', result: null });

    // --- الاستماع لانتهاء تحميل البيانات ---
    useEffect(() => {
        if (window.APP_DATA && window.APP_DATA.isReady) setDataReady(true);
        window.addEventListener('data-loaded', () => setDataReady(true));
    }, []);

    // --- الاتصال بالسحابة (Firebase) ---
    useEffect(() => {
        if (!window.db) return;
        const unsub = window.onSnapshot(window.doc(window.db, "appData", "mainConfig"), (doc) => {
            if (doc.exists()) {
                if(!isAdmin) setConfig(doc.data());
            } else {
                saveToCloud(initialConfig);
            }
        });
        return () => unsub();
    }, [isAdmin]);

    const saveToCloud = async (newData) => {
        if (window.db) {
            try {
                await window.setDoc(window.doc(window.db, "appData", "mainConfig"), newData);
                return true;
            } catch (e) { alert("خطأ: " + e.message); return false; }
        }
        return false;
    };

    const handleManualSave = async () => {
        const success = await saveToCloud(config);
        if(success) showToast('✅ تم حفظ ونشر التعديلات بنجاح');
    };

    // --- دوال النظام ---
    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    const executeSecureAction = () => {
        if(passwordInput !== '12345') { showToast('كلمة المرور خاطئة', 'error'); return; }
        const { action, type, id } = securityModal.data;
        let newConfig = { ...config };
        
        // منطق الحذف والإخفاء المصلح
        if(action === 'delete') {
            if(type === 'news') newConfig.news = newConfig.news.filter(x => x.id !== id);
            if(type === 'teacher') newConfig.teachers = newConfig.teachers.filter(x => x.id !== id);
            if(type === 'halqa') newConfig.halaqat = newConfig.halaqat.filter(x => x.id !== id);
            if(type === 'schedule') newConfig.schedules = newConfig.schedules.filter(x => x.id !== id);
        }
        if(action === 'hide') {
            const toggle = (list) => list.map(x => x.id === id ? {...x, hidden: !x.hidden} : x);
            if(type === 'news') newConfig.news = toggle(newConfig.news);
            if(type === 'teacher') newConfig.teachers = toggle(newConfig.teachers);
            if(type === 'halqa') newConfig.halaqat = toggle(newConfig.halaqat);
            if(type === 'schedule') newConfig.schedules = toggle(newConfig.schedules);
        }

        setConfig(newConfig);
        saveToCloud(newConfig);
        setSecurityModal({ show: false, action: null, data: null });
        setPasswordInput('');
        showToast('تم التنفيذ بنجاح');
    };

    const handleLogin = () => { if(passwordInput === '12345') { setIsAdmin(true); setPage('admin'); setLoginModal(false); } else { showToast('كلمة المرور خطأ', 'error'); } setPasswordInput(''); };
    
    // --- دوال الحاسبة ---
    const runCalc1 = () => {
        const d = parseFloat(calc1.days)||0, a = parseFloat(calc1.amount)||0, c = parseFloat(calc1.completed)||0;
        if (!d || !a) return;
        if (d > 7) { showToast('أيام الحفظ لا تتجاوز 7', 'error'); return; }
        if (c > 30) { showToast('الأجزاء لا تتجاوز 30', 'error'); return; }
        if (a > 1812) { showToast('الحد الأقصى 3 ختمات يومياً', 'error'); return; } 

        const rem = 604 - (c * 20);
        if(rem <= 0) { showToast('مبارك! لقد أتممت الحفظ', 'success'); return; }
        const days = (rem / (d * a)) * 7;
        setCalc1(prev => ({ ...prev, result: days < 1 ? { type: 'hours', val: Math.ceil(days * 24) } : { type: 'date', y: Math.floor(days/365), m: Math.floor((days%365)/30), d: Math.floor((days%365)%30) } }));
    };

    const runCalc2 = () => {
        const y = parseFloat(calc2.y)||0, m = parseFloat(calc2.m)||0, d = parseFloat(calc2.d)||0;
        const totalDays = (y * 365) + (m * 30) + d;
        if(totalDays > 0) setCalc2(prev=>({...prev, result: (604 / totalDays).toFixed(1)}));
        else showToast('الرجاء إدخال المدة', 'error');
    };

    return (
        <div id="app-container" className="min-h-screen flex flex-col relative pb-24">
            {!isOnline && <div className="offline-bar">أنت تتصفح نسخة محفوظة (لا يوجد نت)</div>}
            {toast && <div className="toast-container"><div className={`toast ${toast.type}`}><span>{toast.type === 'success' ? '✅' : '⚠️'}</span> {toast.msg}</div></div>}
            
            {/* النوافذ المنبثقة */}
            {loginModal && (<div className="modal-overlay" onClick={() => setLoginModal(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><div className="text-4xl mb-2">🔐</div><h3 className="text-xl font-black text-gray-800 mb-6">دخول المشرف</h3><input type="password" placeholder="كلمة المرور" className="w-full p-4 bg-gray-50 border-2 rounded-xl text-center text-xl font-black mb-4 outline-none" autoFocus value={passwordInput} onChange={e => setPasswordInput(e.target.value)} /><button onClick={handleLogin} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold mb-2 shadow-lg">دخول</button></div></div>)}
            {securityModal.show && (<div className="modal-overlay" onClick={() => setSecurityModal({ show: false, action: null, data: null })}><div className="modal-content" onClick={e => e.stopPropagation()}><div className="text-4xl mb-2">🛡️</div><h3 className="text-xl font-black text-gray-800 mb-2">تأكيد الإجراء</h3><p className="text-sm text-gray-500 mb-6">أدخل كلمة المرور للتأكيد</p><input type="password" className="w-full p-3 border-2 border-emerald-100 rounded-xl text-center text-xl font-black mb-4 outline-none" autoFocus value={passwordInput} onChange={e => setPasswordInput(e.target.value)} /><div className="flex gap-2"><button onClick={executeSecureAction} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg">تأكيد</button><button onClick={() => setSecurityModal({ show: false })} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">إلغاء</button></div></div></div>)}

            {/* الهيدر */}
            <header className="bg-white sticky top-0 z-50 px-4 py-3 border-b flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2" onClick={() => setPage('home')}>
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg cursor-pointer">ث</div>
                    <h1 className="text-xl font-black text-emerald-800">{config.texts.siteTitle}</h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.location.reload()} className="p-2 rounded-xl bg-gray-100 text-xs font-bold">🔄 تحديث</button>
                    <button onClick={() => { if(isAdmin) setPage('admin'); else { setPasswordInput(''); setLoginModal(true); } }} className={`p-2 rounded-xl transition ${isAdmin ? 'bg-red-50 text-red-500' : 'text-gray-300'}`}>🔒</button>
                </div>
            </header>

            {/* الناف بار */}
            <nav className="bg-white border-b overflow-x-auto no-scrollbar flex px-4 py-2 gap-2 sticky top-[64px] z-40">
                {['home','student_corner','teachers','students','schedules','about','card'].map(t => (
                    <button key={t} onClick={() => setPage(t)} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${page === t ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100'}`}>
                        {{home:'الرئيسية', student_corner:'ركن الطالب', teachers:'المعلمون', students:'الأوائل', schedules:'الجداول', about:'من نحن', card:'بطاقتي'}[t]}
                    </button>
                ))}
            </nav>

            <main className="flex-grow p-4 animate-in">
                {/* 1. الرئيسية */}
                {page === 'home' && (
                    <div className="space-y-6">
                        <section className="relative rounded-[2.5rem] overflow-hidden bg-emerald-700 text-white p-10 text-center shadow-xl">
                            <div className="islamic-pattern"></div>
                            <h2 className="relative z-10 text-3xl font-black mb-3">{config.texts.heroTitle}</h2>
                            <p className="relative z-10 text-sm opacity-90">{config.texts.heroSubtitle}</p>
                            {studentName && <div className="relative z-10 mt-4 bg-white/20 px-4 py-2 rounded-full text-xs font-bold inline-block">مرحباً بك يا {studentName} 🌹</div>}
                        </section>
                        <div className="bg-white p-6 rounded-3xl border-r-[10px] border-amber-500 shadow-sm font-bold text-gray-700">
                            <h3 className="font-black text-xl mb-2 text-emerald-900">⭐ سؤال الأسبوع</h3>
                            <p className="mb-4">{config.texts.weeklyQuestion}</p>
                            <button onClick={() => window.open(`https://wa.me/${config.texts.contact.phone}?text=إجابة السؤال`, '_blank')} className="w-full bg-[#25D366] text-white py-3 rounded-xl flex justify-center items-center gap-2 shadow-lg hover:bg-[#20bd5a] transition font-black">💬 إرسال الإجابة واتساب</button>
                        </div>
                        <section>
                            <h2 className="text-2xl font-black text-slate-800 border-b-4 border-amber-400 pb-1 mb-6 inline-block">آخر الأخبار</h2>
                            <div className="grid gap-6">
                                {config.news.filter(n => !n.hidden).map(n => (
                                    <div key={n.id} className="news-card p-8 text-right">
                                        <div className="flex justify-end text-[10px] font-black text-gray-300 mb-2">● {n.date}</div>
                                        <h3 className="text-2xl font-black mb-3" style={{ color: n.colors?.title || '#1e293b' }}>{n.title}</h3>
                                        <p className="text-sm leading-loose mb-3" style={{ color: n.colors?.content || '#64748b' }}>{n.content}</p>
                                        {n.link?.url && (<a href={n.link.url} target="_blank" className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition" style={{ color: n.colors?.link || '#2563eb' }}>🔗 {n.link.text || 'تفاصيل'}</a>)}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* 2. ركن الطالب (التحديث الكبير) */}
                {page === 'student_corner' && (
                    <div className="space-y-4 animate-in max-w-lg mx-auto">
                        <h2 className="text-center font-black text-3xl text-emerald-900 mb-4">🎓 ركن الطالب المتميز</h2>
                        
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center mb-6">
                            <p className="text-amber-900 font-bold leading-relaxed">{config.texts.studentMsg}</p>
                        </div>

                        {/* زر الحاسبة */}
                        <div onClick={() => setActiveFeature(activeFeature === 'calc' ? null : 'calc')} className={`student-btn-main ${activeFeature === 'calc' ? 'active' : ''}`}><span>📊 حاسبة الحفظ والختم</span><span>{activeFeature === 'calc' ? '➖' : '➕'}</span></div>
                        {activeFeature === 'calc' && (
                            <div className="space-y-4 animate-in">
                                {/* حاسبة بجهدي */}
                                <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-xl">
                                    <h4 className="font-bold text-center text-emerald-800 mb-3">📅 خطة ختم (بجهدي)</h4>
                                    <div className="space-y-2">
                                        <input type="number" className="w-full p-2 bg-gray-50 border rounded" placeholder="أيام الحفظ (ماكس 7)" value={calc1.days} onChange={e => setCalc1({...calc1, days:e.target.value})}/>
                                        <input type="number" className="w-full p-2 bg-gray-50 border rounded" placeholder="المقدار (صفحات)" value={calc1.amount} onChange={e => setCalc1({...calc1, amount:e.target.value})} />
                                        <input type="number" className="w-full p-2 bg-gray-50 border rounded" placeholder="أجزاء محفوظة (ماكس 30)" value={calc1.completed} onChange={e => setCalc1({...calc1, completed:e.target.value})}/>
                                        <button onClick={runCalc1} className="w-full bg-emerald-600 text-white py-2 rounded font-bold">احسب</button>
                                        {calc1.result && <div className="p-3 bg-emerald-50 rounded text-center mt-2 font-bold">{calc1.result.type === 'hours' ? `تحتاج ${calc1.result.val} ساعات` : `تحتاج ${calc1.result.y} سنة و ${calc1.result.m} شهر`}</div>}
                                    </div>
                                </div>
                                {/* حاسبة بوقتي */}
                                <div className="bg-white p-6 rounded-3xl border-2 border-amber-100 shadow-xl">
                                    <h4 className="font-bold text-center text-amber-800 mb-3">🎯 متى تريد أن تختم؟</h4>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <input type="number" className="p-2 border rounded text-center" placeholder="سنة" onChange={e => setCalc2({...calc2, y:e.target.value})}/>
                                        <input type="number" className="p-2 border rounded text-center" placeholder="شهر" onChange={e => setCalc2({...calc2, m:e.target.value})}/>
                                        <input type="number" className="p-2 border rounded text-center" placeholder="يوم" onChange={e => setCalc2({...calc2, d:e.target.value})}/>
                                    </div>
                                    <button onClick={runCalc2} className="w-full bg-amber-500 text-white py-2 rounded font-bold">احسب الورد</button>
                                    {calc2.result && <div className="p-3 bg-emerald-50 rounded text-center mt-2 font-bold">عليك قراءة {calc2.result} صفحة يومياً</div>}
                                </div>
                            </div>
                        )}

                        {/* زر اختبار الحفظ */}
                        <div onClick={() => setActiveFeature(activeFeature === 'test' ? null : 'test')} className={`student-btn-main ${activeFeature === 'test' ? 'active' : ''}`}><span>🧠 اختبر حفظك (الممتحن الآلي)</span><span>{activeFeature === 'test' ? '➖' : '➕'}</span></div>
                        {activeFeature === 'test' && (
                            dataReady ? <TestHifz /> : <div className="text-center p-4 text-gray-500">جاري تحميل قاعدة البيانات...</div>
                        )}

                        {/* زر المصحف */}
                        <div onClick={() => setActiveFeature(activeFeature === 'quran' ? null : 'quran')} className={`student-btn-main ${activeFeature === 'quran' ? 'active' : ''}`}><span>📖 الختمة (المصحف الشريف)</span><span>{activeFeature === 'quran' ? '➖' : '➕'}</span></div>
                        {activeFeature === 'quran' && (
                            dataReady ? <QuranReader /> : <div className="text-center p-4 text-gray-500">جاري تحميل المصحف...</div>
                        )}

                        {/* زر الأذكار والسبحة */}
                        <div onClick={() => setActiveFeature(activeFeature === 'azkar' ? null : 'azkar')} className={`student-btn-main ${activeFeature === 'azkar' ? 'active' : ''}`}><span>📿 الأذكار والسبحة الذكية</span><span>{activeFeature === 'azkar' ? '➖' : '➕'}</span></div>
                        {activeFeature === 'azkar' && (
                            dataReady ? <AzkarApp /> : <div className="text-center p-4 text-gray-500">جاري تحميل الأذكار...</div>
                        )}
                    </div>
                )}

                {/* 3. الجداول (المفصولة) */}
                {page === 'schedules' && (
                    <div className="space-y-8 animate-in">
                        <h2 className="text-center text-3xl font-black text-emerald-900 underline underline-offset-8">📅 الجداول الدراسية</h2>
                        <div>
                            <h3 className="font-black text-xl border-b-2 pb-2 w-fit text-amber-500 border-amber-100 mb-4">☀️ حلقات العصر</h3>
                            {config.schedules.filter(s => s.period === 'عصر' && !s.hidden).map(sch => (
                                <div key={sch.id} className="mb-2">
                                    <div onClick={() => setExpandedSch(expandedSch === sch.id ? null : sch.id)} className={`halqa-accordion ${expandedSch === sch.id ? 'active' : ''}`}><span>حلقة {sch.name}</span><span className="text-2xl">{expandedSch === sch.id ? '−' : '+'}</span></div>
                                    {expandedSch === sch.id && (<div className="bg-white rounded-[1.5rem] shadow-xl overflow-hidden border border-emerald-100 animate-in"><div className="overflow-x-auto"><table className="w-full schedule-table"><thead><tr><th>اليوم</th><th>الوقت</th><th>الملاحظة</th></tr></thead><tbody>{sch.days.map((d, i) => (<tr key={i}><td>{d.day}</td><td className="text-emerald-700">{d.time}</td><td className="text-gray-500 text-sm">{d.note}</td></tr>))}</tbody></table></div></div>)}
                                </div>
                            ))}
                        </div>
                        <div>
                            <h3 className="font-black text-xl border-b-2 pb-2 w-fit text-indigo-500 border-indigo-100 mb-4">🌙 حلقات المغرب</h3>
                            {config.schedules.filter(s => s.period === 'مغرب' && !s.hidden).map(sch => (
                                <div key={sch.id} className="mb-2">
                                    <div onClick={() => setExpandedSch(expandedSch === sch.id ? null : sch.id)} className={`halqa-accordion ${expandedSch === sch.id ? 'active' : ''}`}><span>حلقة {sch.name}</span><span className="text-2xl">{expandedSch === sch.id ? '−' : '+'}</span></div>
                                    {expandedSch === sch.id && (<div className="bg-white rounded-[1.5rem] shadow-xl overflow-hidden border border-emerald-100 animate-in"><div className="overflow-x-auto"><table className="w-full schedule-table"><thead><tr><th>اليوم</th><th>الوقت</th><th>الملاحظة</th></tr></thead><tbody>{sch.days.map((d, i) => (<tr key={i}><td>{d.day}</td><td className="text-emerald-700">{d.time}</td><td className="text-gray-500 text-sm">{d.note}</td></tr>))}</tbody></table></div></div>)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. المعلمون والطلاب وباقي الصفحات */}
                {page === 'teachers' && (
                    <div className="grid gap-4 animate-in">
                        {config.teachers.filter(t => !t.hidden).map(t => (
                            <div key={t.id} className="bg-white p-6 rounded-3xl border flex items-center gap-4 shadow-sm">
                                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-black text-2xl border-2 border-emerald-50">{t.avatar || t.name.charAt(0)}</div>
                                <div><h3 className="font-black text-lg">{t.name}</h3><p className="text-gray-500 text-sm">{t.bio}</p></div>
                            </div>
                        ))}
                    </div>
                )}
                {page === 'students' && <div className="space-y-6 animate-in">{config.halaqat.filter(h => !h.hidden).map(h => (<div key={h.id} className="bg-white rounded-[2.5rem] shadow-lg overflow-hidden border-t-8 border-emerald-500"><div className="bg-emerald-50 p-4 text-center font-black text-emerald-800">حلقة {h.name}</div><div className="p-6 space-y-3">{h.students.map((st, idx) => (<div key={st.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border"><span className="font-bold">{idx+1}. {st.name}</span><span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black">{st.rank}</span></div>))}</div></div>))}</div>}
                {page === 'about' && (<div className="space-y-6 animate-in max-w-xl mx-auto"><div className="bg-white p-8 rounded-[2.5rem] shadow-lg text-center space-y-6 border border-emerald-50"><h2 className="text-2xl font-black text-emerald-800">{config.texts.siteTitle}</h2><p className="text-gray-600 font-bold leading-loose whitespace-pre-line">{config.texts.aboutMain}</p><div className="font-black text-xl italic" style={{ color: config.texts.aboutAyahColor }}>{config.texts.aboutAyah}</div><p className="text-gray-500 font-bold text-sm border-t pt-4">{config.texts.aboutFooter}</p></div><div className="grid grid-cols-2 gap-4"><a href={`tel:${config.texts.contact.phone}`} className="social-box bg-green-50 text-green-600 border border-green-200"><span className="text-3xl mb-2">📞</span><span>اتصل بنا</span></a><a href={config.texts.contact.location} target="_blank" className="social-box bg-blue-50 text-blue-600 border border-blue-200"><span className="text-3xl mb-2">📍</span><span>موقعنا</span></a></div></div>)}
                {page === 'card' && (<div className="max-w-md mx-auto animate-in space-y-6"><div className="bg-white p-8 rounded-[3rem] shadow-xl text-center border-4 border-emerald-50"><h2 className="text-2xl font-black mb-6 text-gray-800">بيانات الطالب</h2><input value={studentName} onChange={e => {setStudentName(e.target.value); localStorage.setItem('st_name', e.target.value)}} className="w-full p-4 bg-gray-50 border rounded-2xl mb-3 text-center font-bold" placeholder="الاسم الثلاثي" /><input value={halaqaName} onChange={e => {setHalaqaName(e.target.value); localStorage.setItem('st_halaqa', e.target.value)}} className="w-full p-4 bg-gray-50 border rounded-2xl mb-6 text-center font-bold" placeholder="اسم الحلقة" /><button onClick={() => { setPage('home'); showToast('تم حفظ البيانات! 🌟'); }} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg">حفظ وتفعيل</button></div>{studentName && (<div className="bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-64 flex flex-col justify-center items-center text-center border-4 border-amber-400"><h1 className="text-3xl font-black mb-2">{studentName}</h1><p className="text-emerald-200 font-bold">حلقة: {halaqaName}</p></div>)}</div>)}

                {/* --- لوحة الإدارة الكاملة (مع الإصلاحات) --- */}
                {isAdmin && page === 'admin' && (
                    <div className="space-y-4 pb-20 animate-in max-w-2xl mx-auto">
                        <h2 className="text-3xl font-black text-emerald-900 mb-8 px-2 tracking-tight">⚙️ لوحة الإدارة</h2>
                        <button onClick={handleManualSave} className="fab-save">💾 حفظ ونشر التعديلات</button>

                        <AdminSection id="sc" title="1. أحجام العرض والنصوص 📏" activeTab={activeAdminTab} setActiveTab={setActiveAdminTab}>
                            <div className="space-y-6"><div><label className="text-sm font-bold text-gray-500 mb-2 block">حجم الموقع</label><input type="range" min="0.5" max="1.2" step="0.05" className="scale-slider" value={config.settings?.layoutScale || 1} onChange={e => setConfig({...config, settings: {...config.settings, layoutScale: parseFloat(e.target.value)}})} /></div></div>
                        </AdminSection>

                        <AdminSection id="txt" title="2. النصوص ورسائل الطالب 📝" activeTab={activeAdminTab} setActiveTab={setActiveAdminTab}>
                            <div className="space-y-4 font-bold relative">
                                <div className="pt-2"><label className="text-xs text-emerald-600 block mb-1">اسم الموقع</label><input className="w-full p-3 border rounded-xl bg-gray-50" value={config.texts.siteTitle} onChange={e => setConfig({...config, texts: {...config.texts, siteTitle: e.target.value}})} /></div>
                                <div><label className="text-xs text-emerald-600 block mb-1">سؤال الأسبوع</label><textarea className="w-full p-3 border rounded-xl h-24 bg-gray-50" value={config.texts.weeklyQuestion} onChange={e => setConfig({...config, texts: {...config.texts, weeklyQuestion: e.target.value}})} /></div>
                                <div className="bg-amber-50 p-2 rounded"><label className="text-xs text-amber-800 block mb-1">رسالة ركن الطالب</label><textarea className="w-full p-3 border rounded-xl h-20 bg-white" value={config.texts.studentMsg} onChange={e => setConfig({...config, texts: {...config.texts, studentMsg: e.target.value}})} /></div>
                            </div>
                        </AdminSection>

                        <AdminSection id="news" title="4. إدارة الأخبار والإعلانات 📰" activeTab={activeAdminTab} setActiveTab={setActiveAdminTab}>
                            <button onClick={() => setConfig({...config, news: [{id: Date.now(), title: '', date: new Date().toISOString().split('T')[0], content: '', hidden: false, colors: {title:'#000', content:'#555', link:'#2563eb'}, link: {url:'', text:'رابط التفاصيل'}}, ...config.news]})} className="w-full bg-emerald-100 text-emerald-700 py-3 rounded-xl font-black mb-4">+ إضافة خبر</button>
                            {config.news.map(n => (
                                <div key={n.id} className={`p-4 border rounded-2xl mb-4 bg-white shadow-sm space-y-3 relative ${n.hidden ? 'item-hidden' : ''}`}>
                                    <div className="flex justify-end gap-2 mb-2 border-b pb-2">
                                        <button onClick={() => setSecurityModal({show:true, action:'hide', type:'news', id:n.id, data:n})} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-bold">{n.hidden ? '👁️ إظهار' : '🚫 إخفاء'}</button>
                                        <button onClick={() => setSecurityModal({show:true, action:'delete', type:'news', id:n.id, data:n})} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-[10px] font-bold">🗑️ حذف</button>
                                    </div>
                                    <div className="flex gap-2"><input className="flex-grow p-2 font-black border rounded-lg" placeholder="عنوان الخبر" value={n.title} onChange={e => {const up = config.news.map(x => x.id === n.id ? {...x, title: e.target.value} : x); setConfig({...config, news: up});}} /><input type="color" className="w-8 h-10 border rounded p-0.5" value={n.colors?.title || '#000'} onChange={e => {const up = config.news.map(x => x.id === n.id ? {...x, colors: {...x.colors, title: e.target.value}} : x); setConfig({...config, news: up});}} /></div>
                                    <textarea className="w-full p-2 bg-white border rounded-lg text-sm" placeholder="التفاصيل..." value={n.content} onChange={e => {const up = config.news.map(x => x.id === n.id ? {...x, content: e.target.value} : x); setConfig({...config, news: up});}} />
                                    <div className="bg-gray-50 p-2 rounded flex gap-2"><input className="flex-grow p-1 border rounded text-xs" placeholder="رابط (https://...)" value={n.link?.url || ''} onChange={e => {const up = config.news.map(x => x.id === n.id ? {...x, link: {...x.link, url: e.target.value}} : x); setConfig({...config, news: up});}} /><input className="w-1/3 p-1 border rounded text-xs" placeholder="نص الرابط" value={n.link?.text || ''} onChange={e => {const up = config.news.map(x => x.id === n.id ? {...x, link: {...x.link, text: e.target.value}} : x); setConfig({...config, news: up});}} /></div>
                                </div>
                            ))}
                        </AdminSection>

                        <button onClick={() => {setIsAdmin(false); setPage('home');}} className="w-full py-4 mt-8 bg-red-600 text-white rounded-2xl font-black shadow-xl active:scale-95 transition">خروج من وضع المدير 🔒</button>
                    </div>
                )}
            </main>

            <footer className="p-6 text-center bg-slate-50 border-t text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                &copy; 2026 {config.texts.siteTitle} | الإصدار الشامل المطور
            </footer>
        </div>
    );
};

// تشغيل التطبيق
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// تفعيل Service Worker للعمل أوفلاين
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
