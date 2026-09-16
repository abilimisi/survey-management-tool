import React from "react";

import AIRobotIcon from "./AIRobotIcon";

import "./AIChatLauncher.css";


export default function AIChatLauncher({
    onClick,
}) {

    return (
        <div className="ai-chat-launcher">

            {/* =====================================================
                TOOLTIP
            ====================================================== */}

            <div className="ai-launcher-tooltip">
                <span>Ask me anything!</span>
            </div>


            {/* =====================================================
                ROBOT BUTTON
            ====================================================== */}

            <button
                type="button"
                className="ai-launcher-button"
                onClick={onClick}
                aria-label="Open PanelSphere AI Analytics Assistant"
                title="Ask PanelSphere AI"
            >

                <AIRobotIcon
                    size={112}
                    className="ai-robot-svg"
                />


                {/* Online indicator */}

                <span
                    className="ai-launcher-online"
                    aria-hidden="true"
                />

            </button>

        </div>
    );
}