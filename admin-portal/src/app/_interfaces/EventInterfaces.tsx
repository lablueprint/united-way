export interface ActivityContent {
    [key: string]: unknown;
}

export interface Activity {
    eventID: string;
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