
import 'dotenv/config';

import { generateBrandBrief } from './src/modules/brand-briefs/ai/gemini.service.js';

const result = await generateBrandBrief({
    brand: {
        name: 'Test Restaurant',
    },
    mainCategory: 'FOOD',
    activityType: 'RESTAURANT',
    templateVersion: '1.1.0',
    questionsAndAnswers: [
        {
            question: 'ما طبيعة النشاط؟',
            answer: 'مطعم يقدم وجبات شرقية.',
        },
        {
            question: 'ما أكثر المنتجات طلباً؟',
            answer: 'المشويات والوجبات العائلية.',
        },
        {
            question: 'من الجمهور المستهدف؟',
            answer: 'العائلات والشباب في المنطقة المحيطة.',
        },
        {
            question: 'ما الهدف الأساسي من التسويق؟',
            answer: 'زيادة الطلبات وتحسين انتشار المطعم.',
        },
    ],
});

console.log('MODEL:', result.modelName);
console.log('PROMPT VERSION:', result.promptVersion);
console.log('BRIEF:');
console.log(JSON.stringify(result.content, null, 2));
