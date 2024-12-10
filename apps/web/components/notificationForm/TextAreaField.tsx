import React from "react";

interface TextAreaFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ value, onChange, placeholder }) => (
    <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px] dark:bg-gray-700 dark:text-gray-200"
        rows={4}
    />
);

export default TextAreaField;
