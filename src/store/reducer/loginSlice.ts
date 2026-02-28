import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    uid?: string;
    phoneNumber?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    token?: string;
    [key: string]: any;
}

interface LoginState {
    isAuthenticated: boolean;
    user: User | null;
}

const initialState: LoginState = {
    isAuthenticated: false,
    user: null,
}

const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<User>) => {
            state.isAuthenticated = true;
            state.user = action.payload;
            // Ensure role is set (default to 'customer' if not provided)
            if (!state.user.role) {
                state.user.role = 'customer';
            }
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
        },
        setUserData: (state, action: PayloadAction<{ isAuthenticated: boolean; user: User | null }>) => {
            state.isAuthenticated = action.payload.isAuthenticated;
            state.user = action.payload.user;
            // Ensure role is set
            if (state.user && !state.user.role) {
                state.user.role = 'customer';
            }
        },
        setUserRole: (state, action: PayloadAction<string>) => {
            if (state.user) {
                state.user.role = action.payload;
            }
        },
    }
})

export const { login, logout, setUserData, setUserRole } = loginSlice.actions
export default loginSlice.reducer
