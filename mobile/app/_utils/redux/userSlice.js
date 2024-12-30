import { createSlice } from '@reduxjs/toolkit'
import * as SecureStore from 'expo-secure-store'

const userSlice = createSlice({
    name: "user",
    initialState: {
        userId: "",
        jwt: ""
    },
    reducers: {
        login: (state, action) => {
            state.userId = action.payload.userId;
            state.jwt = action.payload.jwt;
            console.log("setting secure-store async");
            SecureStore.setItemAsync("user", JSON.stringify(action.payload))
        },
        logout: (state) => {
            // const deleteSecureStoreItem = async () => {
            //     await SecureStore.deleteItemAsync("user");
            // }
            state.userId = "";
            state.jwt = "";
            console.log("Deleting the state");
            SecureStore.deleteItemAsync("user");
        }
    }
})

const {
    login, logout
} = userSlice.actions
export { login, logout };
export default userSlice.reducer;