// Types for the Memory Book Creation Wizard

export type PageCount = 10 | 15 | 20;

export type IllustrationStyle = 'coloring' | 'cartoon' | 'anime' | 'watercolor';

export type ReadingLevel = 'very-simple' | 'standard';

export type Tone = 'warm' | 'joyful' | 'calm';

export interface UploadedImage {
    id: string;
    file: File;
    preview: string;
    name: string;
}

export interface BookSetupData {
    pageCount: PageCount;
    referencePhotos: UploadedImage[];
    illustrationStyle: IllustrationStyle;
    title: string;
    subtitle: string;
    date: string;
}

export interface ChildhoodData {
    birthPlace: string;
    parents: string;
    siblings: string;
    happyMemory: string;
    enjoyedActivities: string;
    photos: UploadedImage[];
}

export interface TeenageData {
    livingPlace: string;
    schoolExperiences: string;
    friendsInterests: string;
    memorableEvents: string;
    photos: UploadedImage[];
}

export interface AdultLifeData {
    career: string;
    hobbiesPassions: string;
    partner: string;
    children: string;
    milestones: string;
    photos: UploadedImage[];
}

export interface LaterLifeData {
    livingPlace: string;
    routinesTraditions: string;
    familyMoments: string;
    comfortJoy: string;
    photos: UploadedImage[];
}

export interface GenerationSettings {
    readingLevel: ReadingLevel;
    tone: Tone;
}

export interface MemoryBookData {
    bookSetup: BookSetupData;
    childhood: ChildhoodData;
    teenage: TeenageData;
    adultLife: AdultLifeData;
    laterLife: LaterLifeData;
    generationSettings: GenerationSettings;
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface StepInfo {
    number: WizardStep;
    title: string;
    description: string;
    isOptional: boolean;
}

export const WIZARD_STEPS: StepInfo[] = [
    { number: 1, title: 'Book Setup', description: 'Basic settings and photos', isOptional: false },
    { number: 2, title: 'Childhood', description: 'Early memories', isOptional: true },
    { number: 3, title: 'Teenage Years', description: 'Growing up', isOptional: true },
    { number: 4, title: 'Adult Life', description: 'Career and family', isOptional: true },
    { number: 5, title: 'Later Life', description: 'Golden years', isOptional: true },
    { number: 6, title: 'Review & Generate', description: 'Final review', isOptional: false },
];

export const getInitialBookSetup = (): BookSetupData => ({
    pageCount: 15,
    referencePhotos: [],
    illustrationStyle: 'watercolor',
    title: '',
    subtitle: '',
    date: new Date().toISOString().split('T')[0],
});

export const getInitialChildhood = (): ChildhoodData => ({
    birthPlace: '',
    parents: '',
    siblings: '',
    happyMemory: '',
    enjoyedActivities: '',
    photos: [],
});

export const getInitialTeenage = (): TeenageData => ({
    livingPlace: '',
    schoolExperiences: '',
    friendsInterests: '',
    memorableEvents: '',
    photos: [],
});

export const getInitialAdultLife = (): AdultLifeData => ({
    career: '',
    hobbiesPassions: '',
    partner: '',
    children: '',
    milestones: '',
    photos: [],
});

export const getInitialLaterLife = (): LaterLifeData => ({
    livingPlace: '',
    routinesTraditions: '',
    familyMoments: '',
    comfortJoy: '',
    photos: [],
});

export const getInitialGenerationSettings = (): GenerationSettings => ({
    readingLevel: 'standard',
    tone: 'warm',
});

export const getInitialMemoryBookData = (): MemoryBookData => ({
    bookSetup: getInitialBookSetup(),
    childhood: getInitialChildhood(),
    teenage: getInitialTeenage(),
    adultLife: getInitialAdultLife(),
    laterLife: getInitialLaterLife(),
    generationSettings: getInitialGenerationSettings(),
});
