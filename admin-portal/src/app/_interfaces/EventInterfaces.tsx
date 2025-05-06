export interface ActivityContent {
    [key: string]: unknown;
}

export interface QuizContent {
    title: string;
    choices: [string];
    answers: [number];
    singleSelect: boolean;
}

export interface Activity {
    _id: string;
    eventID: string;
    type: string;
    content: unknown;
    timeStart: Date;
    timeEnd: Date;
    active: boolean;
}

export const EventTags: string[] = [
    'Sports',
    'Entertainment',
    'Food',
    'Technology',
    'Wellness',
    'Music',
    'Pets',
    'Shopping',
    'Reading',
    'Travel',
    'Home',
    'Vehicles'
];

export interface EventData {
    _id: string;
    name: string;
    date: Date;
    draft: boolean,
    draftList: boolean[],
    description: string;
    startTime: string,
    endTime: string,
    location: {
        type: string;
        coordinates: number[];
    };
    organizerId: string;
    tags: string[];
    registeredUsers: string[];
    activities: Activity[];
}