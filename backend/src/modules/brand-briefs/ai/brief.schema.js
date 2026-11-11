
const sectionSchema = {
    type: 'OBJECT',
    properties: {
        clientInformation: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Facts explicitly provided by the client in onboarding answers.',
        },
        aiAnalysis: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Analysis and insights derived from the provided client information.',
        },
        recommendations: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Actionable recommendations grounded in the available information.',
        },
    },
    required: [
        'clientInformation',
        'aiAnalysis',
        'recommendations',
    ],
    propertyOrdering: [
        'clientInformation',
        'aiAnalysis',
        'recommendations',
    ],
};

export const BRAND_BRIEF_SCHEMA = {
    type: 'OBJECT',
    properties: {
        brandOverview: sectionSchema,
        targetAudience: sectionSchema,
        brandGoals: sectionSchema,
        competitiveAdvantage: sectionSchema,
        brandCommunication: sectionSchema,
        marketingStrategy: sectionSchema,
        contentDirection: sectionSchema,
    },
    required: [
        'brandOverview',
        'targetAudience',
        'brandGoals',
        'competitiveAdvantage',
        'brandCommunication',
        'marketingStrategy',
        'contentDirection',
    ],
    propertyOrdering: [
        'brandOverview',
        'targetAudience',
        'brandGoals',
        'competitiveAdvantage',
        'brandCommunication',
        'marketingStrategy',
        'contentDirection',
    ],
};
