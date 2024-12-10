import React from "react";
import InputField from "./InputField";


interface ActionFieldsProps {
    templateType: string;
    actionLabel1: string;
    setActionLabel1: (value: string) => void;
    actionUrl1: string;
    setActionUrl1: (value: string) => void;
    actionLabel2?: string;
    setActionLabel2?: (value: string) => void;
    actionUrl2?: string;
    setActionUrl2?: (value: string) => void;
}

const ActionFields: React.FC<ActionFieldsProps> = ({
                                                       templateType,
                                                       actionLabel1,
                                                       setActionLabel1,
                                                       actionUrl1,
                                                       setActionUrl1,
                                                       actionLabel2,
                                                       setActionLabel2,
                                                       actionUrl2,
                                                       setActionUrl2,
                                                   }) => (
    <div className="space-y-2">
        <InputField
            value={actionLabel1}
            onChange={setActionLabel1}
            placeholder="Primary Action Button Label"
        />
        <InputField
            value={actionUrl1}
            onChange={setActionUrl1}
            placeholder="Primary Action URL"
        />
        {templateType === "multi_action" && (
            <>
                <InputField
                    value={actionLabel2 || ""}
                    onChange={setActionLabel2!}
                    placeholder="Secondary Action Button Label"
                />
                <InputField
                    value={actionUrl2 || ""}
                    onChange={setActionUrl2!}
                    placeholder="Secondary Action URL"
                />
            </>
        )}
    </div>
);

export default ActionFields;
