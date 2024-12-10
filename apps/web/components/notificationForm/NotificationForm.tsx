import { useState } from "react";
import InputField from "./InputField";
import TextAreaField from "./TextAreaField";
import ActionFields from "./ActionFields";
import TemplateSelector from "./TemplateSelector";
import ImagePreview from "./ImagePreview";
import useIdentifier from "../../hooks/useIdentifier";

export default function NotificationForm() {
    const [message, setMessage] = useState("");
    const [title, setTitle] = useState("");
    const [templateType, setTemplateType] = useState("standard");
    const [actionUrl1, setActionUrl1] = useState("");
    const [actionLabel1, setActionLabel1] = useState("");
    const [actionUrl2, setActionUrl2] = useState("");
    const [actionLabel2, setActionLabel2] = useState("");
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const { subId } = useIdentifier();

    const sendNotification = async () => {
        if (!message || !title) return alert("Title and Message are required!");
        if (templateType === "single_action" && (!actionUrl1 || !actionLabel1)) {
            return alert("Action URL and Label are required for Single Action!");
        }
        if (templateType === "multi_action" && (!actionUrl1 || !actionLabel1 || !actionUrl2 || !actionLabel2)) {
            return alert("Both Action URLs and Labels are required for Multi Action!");
        }

        setLoading(true);
        try {
            await fetch("http://localhost:3002/v1/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    body: message,
                    subId,
                    channel: "feed",
                    notificationType: "feed",
                    imageUrl,
                    actions:
                        templateType === "standard"
                            ? []
                            : [
                                { label: actionLabel1, actionUrl: actionUrl1 },
                                ...(templateType === "multi_action"
                                    ? [{ label: actionLabel2, actionUrl: actionUrl2 }]
                                    : []),
                            ],
                }),
            });
            setMessage("");
            setTitle("");
            setActionUrl1("");
            setActionLabel1("");
            setActionUrl2("");
            setActionLabel2("");
            setImageUrl("");
            setTemplateType("standard");
        } catch (error) {
            console.error("Error sending notification:", error);
            alert("Failed to send notification.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create a Notification</h2>

            <div className="space-y-4">
                <InputField
                    value={title}
                    onChange={setTitle}
                    placeholder="Notification Title"
                />
                <TextAreaField
                    value={message}
                    onChange={setMessage}
                    placeholder="Message to be shown in the notification"
                />
                <ImagePreview imageUrl={imageUrl} setImageUrl={setImageUrl} />
                <TemplateSelector
                    templateType={templateType}
                    setTemplateType={setTemplateType}
                />
                {["single_action", "multi_action"].includes(templateType) && (
                    <ActionFields
                        templateType={templateType}
                        actionLabel1={actionLabel1}
                        setActionLabel1={setActionLabel1}
                        actionUrl1={actionUrl1}
                        setActionUrl1={setActionUrl1}
                        actionLabel2={actionLabel2}
                        setActionLabel2={setActionLabel2}
                        actionUrl2={actionUrl2}
                        setActionUrl2={setActionUrl2}
                    />
                )}
                <button
                    onClick={sendNotification}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Notification"}
                </button>
            </div>
        </div>
    );
}
