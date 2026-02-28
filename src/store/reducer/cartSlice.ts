import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variant?: string;
}

interface CartState {
    items: CartItem[];
    totalQuantity: number;
    totalAmount: number;
    couponCode: string | null;
    discount: number;
}

const initialState: CartState = {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    couponCode: null,
    discount: 0,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const newItem = action.payload;
            const existingItem = state.items.find((item) => item.id === newItem.id);
            state.totalQuantity += newItem.quantity;
            state.totalAmount += newItem.price * newItem.quantity;
            
            if (!existingItem) {
                state.items.push(newItem);
            } else {
                existingItem.quantity += newItem.quantity;
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const existingItem = state.items.find((item) => item.id === id);
            if (existingItem) {
                state.totalQuantity -= existingItem.quantity;
                state.totalAmount -= existingItem.price * existingItem.quantity;
                state.items = state.items.filter((item) => item.id !== id);
            }
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const { id, quantity } = action.payload;
            const existingItem = state.items.find((item) => item.id === id);
            if (existingItem && quantity > 0) {
                const quantityDifference = quantity - existingItem.quantity;
                existingItem.quantity = quantity;
                state.totalQuantity += quantityDifference;
                state.totalAmount += existingItem.price * quantityDifference;
            }
        },
        applyCoupon: (state, action: PayloadAction<{ code: string; amount: number }>) => {
            state.couponCode = action.payload.code;
            state.discount = action.payload.amount;
        },
        removeCoupon: (state) => {
            state.couponCode = null;
            state.discount = 0;
        },
        clearCart: (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalAmount = 0;
            state.couponCode = null;
            state.discount = 0;
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, applyCoupon, removeCoupon, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
