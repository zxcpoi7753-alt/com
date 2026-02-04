export const initialConfig = {
    settings: { layoutScale: 1, textScale: 1 },
    texts: {
        siteTitle: 'حلقات الثريا',
        heroTitle: 'أهلاً بكم في حلقات الثريا',
        heroSubtitle: 'بيئة تربوية جاذبة لتعليم القرآن الكريم وغرس القيم',
        weeklyQuestion: 'من هو الصحابي الذي اهتز لموته عرش الرحمن؟',
        aboutMain: 'نحن حلقات الثريا لتحفيظ القرآن الكريم، حيث لا يُحفظ القرآن بالألسنة فقط، بل تُربّى به القلوب.',
        aboutAyah: '﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾',
        aboutAyahColor: '#059669',
        aboutFooter: 'ومن القرآن... نبدأ، وبه... نرتقي، وعليه... نلقى الله.',
        contact: { phone: '967700000000', location: '#', youtube: '#', facebook: '#', instagram: '#' }
    },
    news: [{ 
        id: 1, title: 'انطلاق المسابقة السنوية', date: '2026-02-01', content: 'نعلن عن بدء التسجيل.', hidden: false,
        colors: { title: '#1e293b', content: '#64748b', link: '#2563eb' }, link: { url: '', text: '' }
    }],
    teachers: [{ id: 1, name: 'الشيخ محمد الفاتح', bio: 'مشرف عام الحلقات.', hidden: false }],
    halaqat: [{ id: 1, name: 'عاصم بن أبي النجود', students: [{ id: 101, name: 'سعيد لطفي', rank: 'الأول' }], hidden: false }],
    schedules: [
        { id: 1, name: 'عمر بن الخطاب', period: 'عصر', hidden: false, days: Array(6).fill(null).map((_, i) => ({day: ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس'][i], time: '4:00 - 5:00 عصراً', note: 'حفظ ومراجعة'})) }
    ]
};
