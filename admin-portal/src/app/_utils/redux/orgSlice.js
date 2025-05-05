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
        },
        refresh: (state, action) => {
            state.authToken = action.payload.orgId;
            localStorage.setItem('org', 
                JSON.stringify({
                    orgId: state.orgId, 
                    authToken: action.payload.authToken, 
                    refreshToken: state.refreshToken
                })
            );
        }
    }
})

const {
    login, logout, refresh
} = orgSlice.actions

export { login, logout, refresh };
export default orgSlice.reducer;