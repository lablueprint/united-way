interface ActivityContent {
    [key: string]: unknown;
}

interface Activity {
    type: string;
    content: ActivityContent;
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
    description: string;
    location: {
        type: string;
        coordinates: number[];
    };
    organizerId: string;
    tags: string[];
    registeredUsers: string[];
    activities: Activity[];
}