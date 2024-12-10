import React from "react";

interface TemplateSelectorProps {
    templateType: string;
    setTemplateType: (value: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templateType, setTemplateType }) => (
    <select
        value={templateType}
        onChange={(e) => setTemplateType(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700"
    >
        <option value="standard">Standard</option>
        <option value="single_action">Single Action</option>
        <option value="multi_action">Multi Action</option>
    </select>
);

export default TemplateSelector;
