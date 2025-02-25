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
            // const deleteSecureStoreItem = async () => {
            //     await SecureStore.deleteItemAsync("user");
            // }
            state.userId = "";
            state.authToken = "";
            state.refreshToken = "";
            SecureStore.deleteItemAsync("user");
        }
    }
})

const {
    login, logout
} = userSlice.actions
export { login, logout };
export default userSlice.reducer;