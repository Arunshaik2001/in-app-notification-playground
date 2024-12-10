import React from "react";
import {on} from "next/dist/client/components/react-dev-overlay/pages/bus";

interface InputFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}

const InputField: React.FC<InputFieldProps> = ({ value, onChange, placeholder }) => (
    <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
);

export default InputField;
