export interface RootState {
    auth: {
        orgId: string;
        authToken: string;
        refreshToken: string;
    };
}