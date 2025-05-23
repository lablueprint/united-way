import { createSlice } from '@reduxjs/toolkit'
import * as SecureStore from 'expo-secure-store'

const userSlice = createSlice({
    name: "user",
    initialState: {
        userId: "",
        authToken: "",
        refreshToken: ""
    },
    reducers: {
        login: (state, action) => {
            state.userId = action.payload.userId;
            state.authToken = action.payload.authToken;
            state.refreshToken = action.payload.refreshToken;
            SecureStore.setItemAsync("user", JSON.stringify(action.payload))
        },
        logout: (state) => {
            state.userId = "";
            state.authToken = "";
            state.refreshToken = "";
            SecureStore.deleteItemAsync("user");
        },
        refresh: (state, action) => {
            state.authToken = action.payload.authToken;
            localStorage.setItem('user', 
                JSON.stringify({
                    userId: state.userId,
                    authToken: action.payload.authToken, 
                    refreshToken: state.refreshToken
                })
            );
        }
    }
})

const {
    login, logout, refresh
} = userSlice.actions
export { login, logout, refresh };
export default userSlice.reducer;