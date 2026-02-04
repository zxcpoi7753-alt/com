// هذا المكون يحتوي على لوحة التحكم الكاملة
const AdminDashboard = ({ config, setConfig, handleSave, setSecurityModal }) => {
    
    // دوال مساعدة للتعديل السريع
    const updateText = (key, val) => setConfig({...config, texts: {...config.texts, [key]: val}});
    const updateContact = (key, val) => setConfig({...config, texts: {...config.texts, contact: {...config.texts.contact, [key]: val}}});

    return (
        <div className="pb-24 animate-in">
            <h2 className="text-2xl font-black text-emerald-800 mb-6 px-2 border-b pb-4">⚙️ لوحة الإدارة الشاملة</h2>

            {/* 1. المظهر والنصوص */}
            <div className="admin-section">
                <h3>1. إعدادات المظهر والنصوص</h3>
                <div className="space-y-3">
                    <div><label className="text-xs font-bold text-gray-500">حجم الموقع</label><input type="range" min="0.5" max="1.2" step="0.05" className="w-full accent-emerald-600" value={config.settings?.layoutScale || 1} onChange={e => setConfig({...config, settings: {...config.settings, layoutScale: e.target.value}})} /></div>
                    <div><label className="text-xs font-bold text-gray-500">اسم الموقع</label><input className="w-full p-2 border rounded" value={config.texts.siteTitle} onChange={e => updateText('siteTitle', e.target.value)} /></div>
                    <div><label className="text-xs font-bold text-gray-500">عنوان الترحيب</label><input className="w-full p-2 border rounded" value={config.texts.heroTitle} onChange={e => updateText('heroTitle', e.target.value)} /></div>
                    <div><label className="text-xs font-bold text-gray-500">الوصف (تحت العنوان)</label><input className="w-full p-2 border rounded" value={config.texts.heroSubtitle} onChange={e => updateText('heroSubtitle', e.target.value)} /></div>
                    <div><label className="text-xs font-bold text-gray-500">سؤال الأسبوع</label><textarea className="w-full p-2 border rounded h-20" value={config.texts.weeklyQuestion} onChange={e => updateText('weeklyQuestion', e.target.value)} /></div>
                </div>
            </div>

            {/* 2. من نحن والروابط */}
            <div className="admin-section">
                <h3>2. من نحن وروابط التواصل</h3>
                <div className="space-y-3">
                    <textarea className="w-full p-2 border rounded h-24 text-sm" placeholder="نص من نحن..." value={config.texts.aboutMain} onChange={e => updateText('aboutMain', e.target.value)} />
                    <input className="w-full p-2 border rounded" placeholder="الآية القرآنية" value={config.texts.aboutAyah} onChange={e => updateText('aboutAyah', e.target.value)} />
                    <input className="w-full p-2 border rounded" placeholder="النص الختامي" value={config.texts.aboutFooter} onChange={e => updateText('aboutFooter', e.target.value)} />
                    
                    <div className="bg-gray-50 p-3 rounded space-y-2 border">
                        <label className="text-xs font-bold text-emerald-600">📞 الروابط:</label>
                        <input className="w-full p-2 border rounded text-xs" placeholder="رقم الهاتف" value={config.texts.contact.phone} onChange={e => updateContact('phone', e.target.value)} />
                        <input className="w-full p-2 border rounded text-xs" placeholder="رابط الموقع (Location)" value={config.texts.contact.location} onChange={e => updateContact('location', e.target.value)} />
                        <input className="w-full p-2 border rounded text-xs" placeholder="رابط يوتيوب" value={config.texts.contact.youtube} onChange={e => updateContact('youtube', e.target.value)} />
                        <input className="w-full p-2 border rounded text-xs" placeholder="رابط فيسبوك" value={config.texts.contact.facebook} onChange={e => updateContact('facebook', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* 3. الأخبار */}
            <div className="admin-section">
                <h3>3. الأخبار والإعلانات</h3>
                <button onClick={() => setConfig({...config, news: [{id: Date.now(), title: '', content: '', date: new Date().toISOString().split('T')[0], hidden: false}, ...config.news]})} className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded font-bold text-xs mb-4 w-full">+ إضافة خبر جديد</button>
                {config.news.map((n, i) => (
                    <div key={n.id} className={`border p-3 rounded mb-2 bg-white ${n.hidden ? 'item-hidden' : ''}`}>
                        <div className="flex justify-between mb-2 border-b pb-2">
                            <button onClick={() => setSecurityModal({show:true, action:'hide', type:'news', id:n.id, data:n})} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">{n.hidden ? 'إظهار' : 'إخفاء'}</button>
                            <button onClick={() => setSecurityModal({show:true, action:'delete', type:'news', id:n.id, data:n})} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">حذف</button>
                        </div>
                        <input className="w-full p-2 border rounded mb-1 font-bold" placeholder="عنوان الخبر" value={n.title} onChange={e => {const up=[...config.news]; up[i].title=e.target.value; setConfig({...config, news:up})}} />
                        <textarea className="w-full p-2 border rounded text-sm" placeholder="التفاصيل..." value={n.content} onChange={e => {const up=[...config.news]; up[i].content=e.target.value; setConfig({...config, news:up})}} />
                    </div>
                ))}
            </div>

            {/* 4. المعلمون */}
            <div className="admin-section">
                <h3>4. المعلمون</h3>
                <button onClick={() => setConfig({...config, teachers: [...config.teachers, {id: Date.now(), name: '', bio: '', hidden: false}]})} className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold text-xs mb-4 w-full">+ إضافة معلم</button>
                {config.teachers.map((t, i) => (
                    <div key={t.id} className={`border p-3 rounded mb-2 bg-white ${t.hidden ? 'item-hidden' : ''}`}>
                        <div className="flex justify-end gap-2 mb-2">
                            <button onClick={() => setSecurityModal({show:true, action:'delete', type:'teacher', id:t.id, data:t})} className="text-red-500 font-bold text-xs">🗑️</button>
                        </div>
                        <input className="w-full p-2 border-b mb-1 font-bold" placeholder="اسم المعلم" value={t.name} onChange={e => {const up=[...config.teachers]; up[i].name=e.target.value; setConfig({...config, teachers:up})}} />
                        <input className="w-full p-2 text-xs text-gray-500" placeholder="الوصف/النبذة" value={t.bio} onChange={e => {const up=[...config.teachers]; up[i].bio=e.target.value; setConfig({...config, teachers:up})}} />
                    </div>
                ))}
            </div>

            {/* 5. أوائل الحلقات */}
            <div className="admin-section">
                <h3>5. أوائل الحلقات (التكريم)</h3>
                <button onClick={() => {const n=prompt('اسم الحلقة:'); if(n) setConfig({...config, halaqat:[...config.halaqat, {id:Date.now(), name:n, students:[], hidden:false}]})}} className="bg-amber-100 text-amber-800 px-4 py-2 rounded font-bold text-xs mb-4 w-full">+ إضافة حلقة جديدة</button>
                {config.halaqat.map((h, i) => (
                    <div key={h.id} className="border p-3 rounded mb-4 bg-amber-50">
                        <div className="flex justify-between items-center mb-2 font-bold text-amber-900">
                            <span>{h.name}</span>
                            <button onClick={() => setSecurityModal({show:true, action:'delete', type:'halqa', id:h.id, data:h})} className="text-red-500">×</button>
                        </div>
                        {h.students.map((st, si) => (
                            <div key={st.id} className="flex gap-1 mb-1">
                                <input className="flex-1 p-1 rounded text-xs" placeholder="اسم الطالب" value={st.name} onChange={e => {
                                    const nh = [...config.halaqat]; nh[i].students[si].name = e.target.value; setConfig({...config, halaqat: nh});
                                }} />
                                <input className="w-16 p-1 rounded text-xs text-center" placeholder="الترتيب" value={st.rank} onChange={e => {
                                    const nh = [...config.halaqat]; nh[i].students[si].rank = e.target.value; setConfig({...config, halaqat: nh});
                                }} />
                                <button onClick={() => {
                                    const nh = [...config.halaqat]; nh[i].students = nh[i].students.filter(x => x.id !== st.id); setConfig({...config, halaqat: nh});
                                }} className="text-red-500 font-bold px-2">×</button>
                            </div>
                        ))}
                        <button onClick={() => {
                            const nh = [...config.halaqat]; nh[i].students.push({id:Date.now(), name:'', rank:''}); setConfig({...config, halaqat: nh});
                        }} className="text-xs bg-white border px-2 py-1 rounded mt-2 w-full text-gray-500">+ إضافة طالب</button>
                    </div>
                ))}
            </div>

            {/* 6. الجداول */}
            <div className="admin-section">
                <h3>6. الجداول الدراسية</h3>
                <div className="flex gap-2 mb-3">
                    <input id="newSchName" className="border p-2 rounded w-full text-xs" placeholder="اسم الحلقة" />
                    <button onClick={() => {
                        const val = document.getElementById('newSchName').value;
                        if(val) setConfig({...config, schedules: [...config.schedules, {id: Date.now(), name: val, period: 'عصر', hidden: false, days: Array(6).fill({}).map((_,x)=>({day:['سبت','أحد','اثنين','ثلاثاء','أربعاء','خميس'][x], time:'', note:''}))}]});
                    }} className="bg-emerald-600 text-white px-4 rounded font-bold text-xs">إضافة</button>
                </div>
                {config.schedules.map((sch, i) => (
                    <div key={sch.id} className="border p-3 rounded mb-4 bg-white">
                        <div className="flex justify-between mb-2 font-bold text-emerald-800">
                            <input value={sch.name} onChange={e => {const s=[...config.schedules]; s[i].name=e.target.value; setConfig({...config, schedules:s})}} className="bg-transparent border-b" />
                            <button onClick={() => setSecurityModal({show:true, action:'delete', type:'schedule', id:sch.id, data:sch})} className="text-red-500">حذف</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="schedule-table">
                                <thead><tr><th>اليوم</th><th>الوقت</th><th>ملاحظة</th></tr></thead>
                                <tbody>
                                    {sch.days.map((d, di) => (
                                        <tr key={di}>
                                            <td className="bg-gray-50 p-1">{d.day}</td>
                                            <td className="p-1"><input className="w-full border rounded p-1 text-center" value={d.time} onChange={e => {
                                                const s=[...config.schedules]; s[i].days[di].time=e.target.value; setConfig({...config, schedules:s});
                                            }} /></td>
                                            <td className="p-1"><input className="w-full border rounded p-1 text-center" value={d.note} onChange={e => {
                                                const s=[...config.schedules]; s[i].days[di].note=e.target.value; setConfig({...config, schedules:s});
                                            }} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {/* زر الحفظ العائم */}
            <button onClick={handleSave} className="admin-btn-save bg-blue-600 text-white px-8 py-3 rounded-full font-black text-sm flex items-center gap-2 hover:scale-105 transition">
                💾 حفظ ونشر جميع التعديلات
            </button>
        </div>
    );
};

// نقوم بإرفاق المكون بالنافذة لكي يستطيع index.html رؤيته
window.AdminDashboard = AdminDashboard;
