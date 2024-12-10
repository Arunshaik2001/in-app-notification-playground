import React from "react";

interface ImagePreviewProps {
    imageUrl: string;
    setImageUrl: (value: string) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, setImageUrl }) => (
    <div className="space-y-2">
        <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-gray-200"
            type="text"
        />
        {imageUrl && (
            <div className="w-full flex justify-center items-center">
                <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-w-full max-h-40 rounded-lg border border-gray-200 shadow-sm mb-4 object-contain"
                />
            </div>
        )}
    </div>
);

export default ImagePreview;
