import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PLATFORM_CONFIG from "@/config/platform";
import { toast } from "sonner";

export const SessionTimeoutHandler = () => {
    const { user, signOut } = useAuth();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (user) {
            timeoutRef.current = setTimeout(() => {
                handleLogout();
            }, PLATFORM_CONFIG.sessionTimeout);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            toast.error("Session Expired", {
                description: "You have been logged out due to 15 minutes of inactivity.",
                duration: 10000,
            });
        } catch (error) {
            console.error("Error during auto logout:", error);
        }
    };

    useEffect(() => {
        if (!user) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            return;
        }

        const events = [
            "mousedown",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart",
            "click"
        ];

        // Reset timer on any of the events
        const handleActivity = () => resetTimer();

        // Initial setup
        resetTimer();

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, handleActivity);
        });

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [user]);

    return null;
};
