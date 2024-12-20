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