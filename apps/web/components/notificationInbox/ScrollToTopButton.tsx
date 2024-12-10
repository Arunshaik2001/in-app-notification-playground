import React from "react";

interface ScrollToTopButtonProps {
    onClick: () => void;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ onClick }) => (
    <div
        onClick={onClick}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white py-2 px-4 rounded-full cursor-pointer z-50 shadow-md hover:bg-blue-600 md:text-[70%]"
    >
        New Notification!
    </div>
);

export default ScrollToTopButton;
