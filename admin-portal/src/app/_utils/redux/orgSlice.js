import { createSlice } from '@reduxjs/toolkit'

const orgSlice = createSlice({
    name: "org",
    initialState: {
        orgId: "",
        authToken: "",
        refreshToken: ""
    },
    reducers: {
        login: (state, action) => {
            state.orgId = action.payload.orgId;
            state.authToken = action.payload.authToken;
            state.refreshToken = action.payload.refreshToken;
            localStorage.setItem('org', JSON.stringify(action.payload));
        },
        logout: (state) => {
            state.orgId = "";
            state.authToken = "";
            state.refreshToken = "";
            localStorage.removeItem('org');
        }
    }
})

const {
    login, logout
} = orgSlice.actions
export { login, logout };
export default orgSlice.reducer;