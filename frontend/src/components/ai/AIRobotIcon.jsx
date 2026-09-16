import React from "react";

export default function AIRobotIcon({
    size = 112,
    className = "",
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 112 112"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            role="img"
            aria-label="PanelSphere AI assistant"
        >
            <defs>

                {/* Main blue/purple background */}
                <radialGradient
                    id="aiRobotBackground"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(52 38) rotate(75) scale(67)"
                >
                    <stop
                        offset="0"
                        stopColor="#6366F1"
                    />

                    <stop
                        offset="0.55"
                        stopColor="#4F46E5"
                    />

                    <stop
                        offset="1"
                        stopColor="#3730A3"
                    />
                </radialGradient>


                {/* Robot head */}
                <linearGradient
                    id="aiRobotHead"
                    x1="30"
                    y1="22"
                    x2="82"
                    y2="90"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop
                        offset="0"
                        stopColor="#FFFFFF"
                    />

                    <stop
                        offset="0.7"
                        stopColor="#F1F5FF"
                    />

                    <stop
                        offset="1"
                        stopColor="#E0E7FF"
                    />
                </linearGradient>


                {/* Face */}
                <linearGradient
                    id="aiRobotFace"
                    x1="36"
                    y1="43"
                    x2="77"
                    y2="72"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop
                        offset="0"
                        stopColor="#172554"
                    />

                    <stop
                        offset="1"
                        stopColor="#0F172A"
                    />
                </linearGradient>


                {/* Eye glow */}
                <filter
                    id="aiEyeGlow"
                    x="-100%"
                    y="-100%"
                    width="300%"
                    height="300%"
                >
                    <feGaussianBlur
                        stdDeviation="2"
                        result="blur"
                    />

                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>


                {/* Robot shadow */}
                <filter
                    id="aiRobotShadow"
                    x="-40%"
                    y="-40%"
                    width="180%"
                    height="200%"
                >
                    <feDropShadow
                        dx="0"
                        dy="5"
                        stdDeviation="5"
                        floodColor="#1E1B4B"
                        floodOpacity="0.25"
                    />
                </filter>


                {/* Background glow */}
                <filter
                    id="aiBackgroundGlow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                >
                    <feGaussianBlur
                        stdDeviation="4"
                    />
                </filter>

            </defs>


            {/* =====================================================
                SOFT OUTER GLOW
            ====================================================== */}

            <circle
                cx="56"
                cy="57"
                r="48"
                fill="#6366F1"
                opacity="0.18"
                filter="url(#aiBackgroundGlow)"
            />


            {/* =====================================================
                BLUE / PURPLE OUTER CIRCLE
            ====================================================== */}

            <circle
                cx="56"
                cy="56"
                r="47"
                fill="url(#aiRobotBackground)"
            />


            {/* subtle inner highlight */}

            <circle
                cx="56"
                cy="56"
                r="43"
                stroke="#818CF8"
                strokeOpacity="0.18"
                strokeWidth="1"
            />


            {/* =====================================================
                ANTENNA
            ====================================================== */}

            <rect
                x="54.5"
                y="11"
                width="3"
                height="12"
                rx="1.5"
                fill="#CBD5E1"
            />


            {/* Antenna ball */}

            <circle
                cx="56"
                cy="9"
                r="5"
                fill="#818CF8"
            />

            <circle
                cx="54.5"
                cy="7.5"
                r="1.5"
                fill="#C7D2FE"
                opacity="0.9"
            />


            {/* =====================================================
                ROBOT EARS
            ====================================================== */}

            <g filter="url(#aiRobotShadow)">

                {/* left ear */}

                <rect
                    x="18"
                    y="48"
                    width="11"
                    height="23"
                    rx="5.5"
                    fill="#E0E7FF"
                />

                <rect
                    x="19.5"
                    y="52"
                    width="3"
                    height="15"
                    rx="1.5"
                    fill="#C7D2FE"
                />


                {/* right ear */}

                <rect
                    x="83"
                    y="48"
                    width="11"
                    height="23"
                    rx="5.5"
                    fill="#E0E7FF"
                />

                <rect
                    x="89.5"
                    y="52"
                    width="3"
                    height="15"
                    rx="1.5"
                    fill="#C7D2FE"
                />

            </g>


            {/* =====================================================
                ROBOT HEAD
            ====================================================== */}

            <g filter="url(#aiRobotShadow)">

                <rect
                    x="26"
                    y="22"
                    width="60"
                    height="68"
                    rx="29"
                    fill="url(#aiRobotHead)"
                />


                {/* head highlight */}

                <ellipse
                    cx="47"
                    cy="34"
                    rx="14"
                    ry="7"
                    fill="#FFFFFF"
                    opacity="0.75"
                />

            </g>


            {/* =====================================================
                FACE DISPLAY
            ====================================================== */}

            <rect
                x="34"
                y="43"
                width="44"
                height="29"
                rx="12"
                fill="url(#aiRobotFace)"
            />


            {/* Face inner highlight */}

            <rect
                x="35"
                y="44"
                width="42"
                height="27"
                rx="11"
                stroke="#334155"
                strokeOpacity="0.35"
            />


            {/* =====================================================
                EYES
            ====================================================== */}

            <g filter="url(#aiEyeGlow)">

                <circle
                    cx="47"
                    cy="55"
                    r="3.5"
                    fill="#67E8F9"
                />

                <circle
                    cx="65"
                    cy="55"
                    r="3.5"
                    fill="#67E8F9"
                />

            </g>


            {/* eye highlights */}

            <circle
                cx="46"
                cy="54"
                r="1"
                fill="#FFFFFF"
                opacity="0.8"
            />

            <circle
                cx="64"
                cy="54"
                r="1"
                fill="#FFFFFF"
                opacity="0.8"
            />


            {/* =====================================================
                SMILE
            ====================================================== */}

            <path
                d="M49 62C51 65 61 65 63 62"
                stroke="#67E8F9"
                strokeWidth="2"
                strokeLinecap="round"
            />


            {/* =====================================================
                SMALL CHEEK HIGHLIGHTS
            ====================================================== */}

            <circle
                cx="40"
                cy="62"
                r="1.5"
                fill="#818CF8"
                opacity="0.55"
            />

            <circle
                cx="72"
                cy="62"
                r="1.5"
                fill="#818CF8"
                opacity="0.55"
            />

        </svg>
    );
}