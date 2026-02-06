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

export type Gender = 'male' | 'female';
export type SkinColor = 'light' | 'fair' | 'medium' | 'olive' | 'tan' | 'brown' | 'dark';
export type HairColor = 'blonde' | 'golden' | 'brown' | 'dark-brown' | 'black' | 'red' | 'gray' | 'white';
export type HairStyle = 'short' | 'medium' | 'long' | 'curly' | 'wavy' | 'bald' | 'buzz-cut' | 'ponytail' | 'bun';

export interface PhysicalCharacteristicsData {
    name: string;
    gender: Gender | null;
    skinColor: SkinColor | null;
    hairColor: HairColor | null;
    hairStyle: HairStyle | null;
    hasGlasses: boolean;
    hasFacialHair: boolean;
}

export type ReferenceInputMode = 'photos' | 'characteristics';

export interface BookSetupData {
    pageCount: PageCount;
    referencePhotos: UploadedImage[];
    referenceInputMode: ReferenceInputMode;
    physicalCharacteristics: PhysicalCharacteristicsData;
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

/** Simplified memories - one free-text field per life phase */
export interface MemoriesData {
    childhood: string;
    teenage: string;
    adultLife: string;
    laterLife: string;
}

export interface GenerationSettings {
    readingLevel: ReadingLevel;
    tone: Tone;
}

export interface MemoryBookData {
    bookSetup: BookSetupData;
    memories: MemoriesData;
    // Legacy fields kept for backwards compatibility with saved drafts
    childhood: ChildhoodData;
    teenage: TeenageData;
    adultLife: AdultLifeData;
    laterLife: LaterLifeData;
    generationSettings: GenerationSettings;
}

export type WizardStep = 1 | 2 | 3;

export interface StepInfo {
    number: WizardStep;
    title: string;
    description: string;
    isOptional: boolean;
}

export const WIZARD_STEPS: StepInfo[] = [
    { number: 1, title: 'Book Setup', description: 'Basic settings and photos', isOptional: false },
    { number: 2, title: 'Memories', description: 'Share their story', isOptional: false },
    { number: 3, title: 'Review & Generate', description: 'Final review', isOptional: false },
];

export const getInitialPhysicalCharacteristics = (): PhysicalCharacteristicsData => ({
    name: '',
    gender: null,
    skinColor: null,
    hairColor: null,
    hairStyle: null,
    hasGlasses: false,
    hasFacialHair: false,
});

export const getInitialBookSetup = (): BookSetupData => ({
    pageCount: 15,
    referencePhotos: [],
    referenceInputMode: 'photos',
    physicalCharacteristics: getInitialPhysicalCharacteristics(),
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

export const getInitialMemories = (): MemoriesData => ({
    childhood: '',
    teenage: '',
    adultLife: '',
    laterLife: '',
});

export const getInitialMemoryBookData = (): MemoryBookData => ({
    bookSetup: getInitialBookSetup(),
    memories: getInitialMemories(),
    childhood: getInitialChildhood(),
    teenage: getInitialTeenage(),
    adultLife: getInitialAdultLife(),
    laterLife: getInitialLaterLife(),
    generationSettings: getInitialGenerationSettings(),
});
