export default interface RootState {
    auth: {
        userId: string;
        authToken: string;
        refreshToken: string;
    };
}