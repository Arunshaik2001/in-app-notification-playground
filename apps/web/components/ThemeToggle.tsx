"use client";

import React, { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    // Persist theme in localStorage
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") as "light" | "dark";
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.classList.toggle("dark", storedTheme === "dark");
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {theme === "dark" ? (
                <SunIcon className="h-6 w-6 text-yellow-400" />
            ) : (
                <MoonIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
            )}
        </button>
    );
};

export default ThemeToggle;
