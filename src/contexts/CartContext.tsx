import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface CartItem {
    id: string;
    product_id: string;
    name: string;
    price: number;
    image_url: string;
    quantity: number;
    variant_id?: string;
    variant_name?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeFromCart: (id: string, variant_id?: string) => void;
    updateQuantity: (id: string, variant_id: string | undefined, delta: number) => void;
    clearCart: () => void;
    cartTotal: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load cart from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("ecom_cart");
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem("ecom_cart", JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Omit<CartItem, "quantity">, quantity = 1) => {
        setItems(prev => {
            const existingIndex = prev.findIndex(
                item => item.product_id === product.product_id && item.variant_id === product.variant_id
            );

            if (existingIndex > -1) {
                const newItems = [...prev];
                newItems[existingIndex].quantity += quantity;
                return newItems;
            }

            return [...prev, { ...product, quantity }];
        });

        toast.success("Boutique Selection Added", {
            description: `${product.name} has been curated into your bag.`,
            icon: <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white mr-2"><Sparkles className="w-4 h-4" /></div>,
            className: "rounded-[2rem] bg-white border border-black/5 shadow-premium text-black p-6",
        });
    };

    const removeFromCart = (id: string, variant_id?: string) => {
        setItems(prev => prev.filter(item => !(item.product_id === id && item.variant_id === variant_id)));
    };

    const updateQuantity = (id: string, variant_id: string | undefined, delta: number) => {
        setItems(prev => {
            return prev.map(item => {
                if (item.product_id === id && item.variant_id === variant_id) {
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            });
        });
    };

    const clearCart = () => setItems([]);

    const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items, addToCart, removeFromCart, updateQuantity,
            clearCart, cartTotal, itemCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
