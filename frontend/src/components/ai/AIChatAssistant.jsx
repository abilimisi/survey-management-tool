import React, { useState } from "react";

import AIChatLauncher from "./AIChatLauncher";
import AIAnalyticsChat from "./AIAnalyticsChat";


export default function AIChatAssistant() {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <AIChatLauncher
                onClick={() => setIsOpen(true)}
            />

            <AIAnalyticsChat
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}