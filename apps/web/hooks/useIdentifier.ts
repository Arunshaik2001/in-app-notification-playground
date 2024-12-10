"use client";

import {generateRandom7DigitNumber} from "@repo/utils/utils";

const useIdentifier = () => {

    const ISSERVER = typeof window === "undefined";

    if(!ISSERVER) {
        let storedSubId = localStorage.getItem("subId");

        if (!storedSubId) {
            storedSubId = String(generateRandom7DigitNumber());
            localStorage.setItem("subId", storedSubId);
        }

        return {subId: storedSubId};
    }
    return {subId: "12345"};
};

export default useIdentifier;
