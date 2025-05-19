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
    title: string;
}

export const EventTags: string[] = [
    'Sports',
    'Entertainment',
    'Food',
    'Technology',
    'Wellness',
    'Music',
    'Pets',
    'Travel',
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
    imageUrl: string;
    userCount: number;
    registeredUsers: string[];
    activities: Activity[];
}

export interface EventEditorProps {
    orgName: string;
    changeState: React.Dispatch<React.SetStateAction<boolean>>;
    eventId: string;
    justCreated: boolean;
}

export interface LocationProps {
    display_name: string;
    lat: string;
    lon: string;
}