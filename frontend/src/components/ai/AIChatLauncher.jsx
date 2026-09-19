import React, { useEffect, useRef, useState } from "react";

import AIRobotIcon from "./AIRobotIcon";

import "./AIChatLauncher.css";

const STORAGE_KEY = "panelsphere-ai-launcher-position";

export default function AIChatLauncher({ onClick }) {
    const launcherRef = useRef(null);

    /*
    ============================================================
    DRAG STATE
    ============================================================
    */

    const dragStartRef = useRef({
        pointerX: 0,
        pointerY: 0,
        left: 0,
        top: 0,
    });

    /*
    IMPORTANT:
    This prevents pointer movement from doing anything unless
    the user has actually pressed and is holding the robot.
    */
    const isPointerDownRef = useRef(false);

    const isDraggingRef = useRef(false);

    const hasMovedRef = useRef(false);

    const [position, setPosition] = useState(null);

    const [isDragging, setIsDragging] = useState(false);


    /*
    ============================================================
    LOAD SAVED POSITION
    ============================================================
    */

    useEffect(() => {
        try {
            const savedPosition =
                localStorage.getItem(STORAGE_KEY);

            if (savedPosition) {
                const parsedPosition =
                    JSON.parse(savedPosition);

                if (
                    typeof parsedPosition.left === "number" &&
                    typeof parsedPosition.top === "number"
                ) {
                    setPosition(parsedPosition);
                }
            }
        } catch (error) {
            console.warn(
                "Unable to restore AI chatbot launcher position.",
                error
            );
        }
    }, []);


    /*
    ============================================================
    KEEP LAUNCHER INSIDE VIEWPORT
    ============================================================
    */

    const clampPosition = (left, top) => {
        const launcher = launcherRef.current;

        if (!launcher) {
            return {
                left,
                top,
            };
        }

        const rect =
            launcher.getBoundingClientRect();

        const maxLeft = Math.max(
            0,
            window.innerWidth - rect.width
        );

        const maxTop = Math.max(
            0,
            window.innerHeight - rect.height
        );

        return {
            left: Math.min(
                Math.max(0, left),
                maxLeft
            ),

            top: Math.min(
                Math.max(0, top),
                maxTop
            ),
        };
    };


    /*
    ============================================================
    POINTER DOWN
    ============================================================
    */

    const handlePointerDown = (event) => {
        /*
        Only primary mouse button.
        Touch and pen are allowed.
        */
        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {
            return;
        }

        const launcher =
            launcherRef.current;

        if (!launcher) {
            return;
        }

        const rect =
            launcher.getBoundingClientRect();

        /*
        Mark that the user is now actively holding
        the launcher.
        */
        isPointerDownRef.current = true;

        isDraggingRef.current = false;

        hasMovedRef.current = false;

        dragStartRef.current = {
            pointerX: event.clientX,
            pointerY: event.clientY,

            left: rect.left,
            top: rect.top,
        };

        /*
        Capture the pointer so dragging continues even
        if the cursor moves slightly outside the button.
        */
        try {
            event.currentTarget.setPointerCapture(
                event.pointerId
            );
        } catch {
            // Ignore unsupported pointer capture.
        }
    };


    /*
    ============================================================
    POINTER MOVE
    ============================================================
    */

    const handlePointerMove = (event) => {
        /*
        CRITICAL:
        Do absolutely nothing unless the user is currently
        holding the mouse/touch down.
        */
        if (!isPointerDownRef.current) {
            return;
        }

        const deltaX =
            event.clientX -
            dragStartRef.current.pointerX;

        const deltaY =
            event.clientY -
            dragStartRef.current.pointerY;

        /*
        Small movements are still treated as a click.
        */
        const dragThreshold = 5;

        if (
            !isDraggingRef.current &&
            Math.abs(deltaX) < dragThreshold &&
            Math.abs(deltaY) < dragThreshold
        ) {
            return;
        }

        /*
        Dragging has officially started.
        */
        if (!isDraggingRef.current) {
            isDraggingRef.current = true;

            hasMovedRef.current = true;

            setIsDragging(true);
        }

        const newLeft =
            dragStartRef.current.left +
            deltaX;

        const newTop =
            dragStartRef.current.top +
            deltaY;

        const clampedPosition =
            clampPosition(
                newLeft,
                newTop
            );

        setPosition(clampedPosition);
    };


    /*
    ============================================================
    POINTER UP
    ============================================================
    */

    const handlePointerUp = (event) => {
        /*
        User is no longer holding the launcher.
        */
        isPointerDownRef.current = false;

        try {
            event.currentTarget.releasePointerCapture(
                event.pointerId
            );
        } catch {
            // Ignore if pointer capture was already released.
        }

        /*
        Save the dropped position.
        */
        if (
            isDraggingRef.current &&
            position
        ) {
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(position)
                );
            } catch (error) {
                console.warn(
                    "Unable to save AI chatbot launcher position.",
                    error
                );
            }
        }

        isDraggingRef.current = false;

        setIsDragging(false);
    };


    /*
    ============================================================
    POINTER CANCEL
    ============================================================
    */

    const handlePointerCancel = (event) => {
        isPointerDownRef.current = false;

        isDraggingRef.current = false;

        setIsDragging(false);

        try {
            event.currentTarget.releasePointerCapture(
                event.pointerId
            );
        } catch {
            // Ignore pointer capture errors.
        }
    };


    /*
    ============================================================
    CLICK
    ============================================================
    */

    const handleClick = (event) => {
        /*
        If the user actually dragged the robot,
        don't open the chatbot.
        */
        if (hasMovedRef.current) {
            event.preventDefault();

            event.stopPropagation();

            hasMovedRef.current = false;

            return;
        }

        /*
        Normal click = open chatbot.
        */
        onClick?.();
    };


    /*
    ============================================================
    KEEP POSITION INSIDE VIEWPORT AFTER RESIZE
    ============================================================
    */

    useEffect(() => {
        const handleResize = () => {
            if (!position) {
                return;
            }

            const clampedPosition =
                clampPosition(
                    position.left,
                    position.top
                );

            if (
                clampedPosition.left !==
                    position.left ||
                clampedPosition.top !==
                    position.top
            ) {
                setPosition(clampedPosition);

                try {
                    localStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify(
                            clampedPosition
                        )
                    );
                } catch {
                    // Ignore localStorage errors.
                }
            }
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        return () => {
            window.removeEventListener(
                "resize",
                handleResize
            );
        };
    }, [position]);


    /*
    ============================================================
    DYNAMIC POSITION
    ============================================================
    */

    const launcherStyle = position
        ? {
              left: `${position.left}px`,
              top: `${position.top}px`,
              right: "auto",
              bottom: "auto",
          }
        : {};


    /*
    ============================================================
    RENDER
    ============================================================
    */

    return (
        <div
            ref={launcherRef}
            className={`ai-chat-launcher ${
                isDragging
                    ? "is-dragging"
                    : ""
            } ${
                position
                    ? "is-positioned"
                    : ""
            }`}
            style={launcherStyle}
        >

            {/* =====================================================
                TOOLTIP
            ====================================================== */}

            <div className="ai-launcher-tooltip">
                <span>
                    Ask me anything!
                </span>
            </div>


            {/* =====================================================
                ROBOT BUTTON
            ====================================================== */}

            <button
                type="button"
                className="ai-launcher-button"

                onPointerDown={
                    handlePointerDown
                }

                onPointerMove={
                    handlePointerMove
                }

                onPointerUp={
                    handlePointerUp
                }

                onPointerCancel={
                    handlePointerCancel
                }

                onClick={
                    handleClick
                }

                aria-label="Open PanelSphere AI Analytics Assistant"

                title="Ask PanelSphere AI"
            >

                <AIRobotIcon
                    size={85}
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