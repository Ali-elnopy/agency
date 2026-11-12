
import { GoogleGenAI } from '@google/genai';

import {
    BRIEF_PROMPT_VERSION,
    buildBriefPrompt,
} from './brief.prompt.js';

import { BRAND_BRIEF_SCHEMA } from './brief.schema.js';

let ai = null;

function getAiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
    }

    if (!ai) {
        ai = new GoogleGenAI({ apiKey });
    }

    return { ai, modelName };
}

export const generateBrandBrief = async ({
    brand,
    mainCategory,
    activityType,
    templateVersion,
    questionsAndAnswers,
}) => {
    const { ai, modelName } = getAiClient();

    const prompt = buildBriefPrompt({
        brand,
        mainCategory,
        activityType,
        templateVersion,
        questionsAndAnswers,
    });

    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseJsonSchema: BRAND_BRIEF_SCHEMA,
        },
    });

    const responseText = response.text;

    if (!responseText) {
        throw new Error('Gemini returned an empty response.');
    }

    let content;

    try {
        content = JSON.parse(responseText);
    } catch {
        throw new Error('Gemini returned an invalid JSON response.');
    }

    const requiredSections = [
        'brandOverview',
        'targetAudience',
        'brandGoals',
        'competitiveAdvantage',
        'brandCommunication',
        'marketingStrategy',
        'contentDirection',
    ];

    for (const section of requiredSections) {
        const sectionData = content[section];

        if (
            !sectionData ||
            !Array.isArray(sectionData.clientInformation) ||
            !Array.isArray(sectionData.aiAnalysis) ||
            !Array.isArray(sectionData.recommendations)
        ) {
            throw new Error(
                `Gemini returned an invalid Brand Brief section: ${section}`,
            );
        }
    }

    return {
        content,
        modelName,
        promptVersion: BRIEF_PROMPT_VERSION,
    };
};
