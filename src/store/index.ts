import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Slices
import loginReducer from "./reducer/loginSlice";
import cartReducer from "./reducer/cartSlice";
import productsReducer from "./reducer/productsSlice";

// Persist config for specific slices
const persistConfig = {
    key: "ecommerce-root",
    version: 1,
    storage,
    whitelist: ["login", "cart"], // Only persist auth and cart
};

const rootReducer = combineReducers({
    login: loginReducer,
    cart: cartReducer,
    products: productsReducer,
    // wishlist: wishlistReducer,
    // orders: ordersReducer,
    // user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
