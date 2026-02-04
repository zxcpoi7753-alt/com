import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

// الهيكل المبدئي في حال كانت قاعدة البيانات فارغة
const initialConfig = {
    settings: { layoutScale: 1, textScale: 1 },
    texts: {
        siteTitle: 'حلقات الثريا',
        heroTitle: 'أهلاً بكم في حلقات الثريا',
        heroSubtitle: 'بيئة تربوية جاذبة لتعليم القرآن الكريم',
        weeklyQuestion: 'من هو الصحابي الذي اهتز لموته عرش الرحمن؟',
        aboutMain: 'نحن حلقات الثريا...',
        aboutAyah: '﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾',
        aboutAyahColor: '#059669',
        aboutFooter: 'ومن القرآن... نبدأ.',
        contact: { phone: '967700000000', location: '#', youtube: '#', facebook: '#', instagram: '#' }
    },
    news: [],
    teachers: [],
    halaqat: [],
    schedules: []
};

export const useAppData = () => {
    const [data, setData] = useState(initialConfig);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // الاستماع المباشر للتغييرات في قاعدة البيانات
        const unsub = onSnapshot(doc(db, "appData", "mainConfig"), (doc) => {
            if (doc.exists()) {
                setData(doc.data());
            } else {
                // إنشاء البيانات لأول مرة إذا لم تكن موجودة
                setDoc(doc.ref, initialConfig);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    // دالة الحفظ التي سيستخدمها الأدمن
    const updateData = async (newData) => {
        try {
            await setDoc(doc(db, "appData", "mainConfig"), newData);
            return true;
        } catch (error) {
            console.error("Error saving:", error);
            return false;
        }
    };

    return { data, updateData, loading };
};
