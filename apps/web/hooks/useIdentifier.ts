"use client";
import {generateRandom7DigitNumber} from "@repo/utils/utils";

const useIdentifier = () => {

    let storedSubId = localStorage.getItem("subId");

    if (!storedSubId) {
        storedSubId = String(generateRandom7DigitNumber());
        localStorage.setItem("subId", storedSubId);
    }

    return {subId: storedSubId};
};

export default useIdentifier;
