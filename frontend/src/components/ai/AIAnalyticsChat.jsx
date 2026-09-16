import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
    Sparkles,
    X,
    Send,
    RotateCcw,
    Bot,
    User,
    Lightbulb,
} from "lucide-react";

import { askAIAnalytics } from "../../api/analyticsApi";

import "./AIAnalyticsChat.css";


export default function AIAnalyticsChat({ isOpen, onClose }) {

    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);


    const suggestedQuestions = [
        "Which vendor is performing best?",
        "Which project needs attention?",
        "What is the overall completion rate?",
        "How are survey hits trending?",
    ];


    /*
     * Scroll to the latest message.
     */
    useEffect(() => {

        if (!isOpen) {
            return;
        }

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages, loading, isOpen]);


    /*
     * Focus input when chatbot opens.
     */
    useEffect(() => {

        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }

    }, [isOpen]);


    /*
     * Ask AI.
     */
    const handleAskAI = async (questionText = question) => {

        const trimmedQuestion = questionText.trim();

        if (!trimmedQuestion || loading) {
            return;
        }


        setError("");

        setQuestion("");


        /*
         * Add user's message immediately.
         */
        setMessages((previous) => [
            ...previous,
            {
                id: Date.now(),
                role: "user",
                content: trimmedQuestion,
            },
        ]);


        setLoading(true);


        try {

            const data = await askAIAnalytics(trimmedQuestion);


            setMessages((previous) => [
                ...previous,
                {
                    id: Date.now() + 1,
                    role: "assistant",
                    content: data.answer,
                },
            ]);

        } catch (error) {

            console.error(
                "AI Analytics Error:",
                error
            );


            setError(
                error.response?.data?.error ||
                "Unable to get AI analytics response."
            );

        } finally {

            setLoading(false);

        }
    };


    /*
     * Suggested question.
     */
    const handleSuggestedQuestion = (suggestion) => {

        handleAskAI(suggestion);

    };


    /*
     * Clear conversation.
     */
    const handleClearChat = () => {

        if (loading) {
            return;
        }

        setMessages([]);
        setQuestion("");
        setError("");

        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);

    };


    /*
     * Enter key.
     */
    const handleKeyDown = (event) => {

        if (event.key === "Enter" && !event.shiftKey) {

            event.preventDefault();

            handleAskAI();

        }
    };


    if (!isOpen) {
        return null;
    }


    return (
        <>
            {/* Backdrop */}
            <div
                className="ai-chat-backdrop"
                onClick={onClose}
            />


            {/* Chat drawer */}
            <aside
                className="ai-chat-drawer"
                aria-label="PanelSphere AI Analytics Assistant"
            >

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className="ai-chat-header">

                    <div className="ai-chat-brand">

                        <div className="ai-chat-logo">
                            <Sparkles size={20} />
                        </div>

                        <div>
                            <h2>
                                PANELSPHERE AI
                            </h2>

                            <span>
                                Analytics Assistant
                            </span>
                        </div>

                    </div>


                    <div className="ai-chat-header-actions">

                        <div className="ai-online-status">
                            <span className="ai-online-dot" />
                            Online
                        </div>


                        <button
                            type="button"
                            className="ai-icon-button"
                            onClick={onClose}
                            aria-label="Close AI assistant"
                        >
                            <X size={20} />
                        </button>

                    </div>

                </div>


                {/* =====================================================
                    CHAT BODY
                ====================================================== */}

                <div className="ai-chat-body">

                    {/* Welcome message */}
                    {messages.length === 0 && (

                        <div className="ai-welcome">

                            <div className="ai-welcome-icon">
                                <Bot size={28} />
                            </div>

                            <h3>
                                Hello! 👋
                            </h3>

                            <p>
                                I'm your AI Analytics Assistant.
                                I can help you understand survey
                                performance, vendors, projects,
                                and trends.
                            </p>

                            <p>
                                Ask me a question about your
                                PanelSphere analytics.
                            </p>

                        </div>

                    )}


                    {/* Suggested questions */}
                    {messages.length === 0 && (

                        <div className="ai-suggestions">

                            <div className="ai-suggestions-title">

                                <Lightbulb size={16} />

                                <span>
                                    Try asking
                                </span>

                            </div>


                            <div className="ai-suggestion-list">

                                {suggestedQuestions.map(
                                    (suggestion) => (

                                        <button
                                            key={suggestion}
                                            type="button"
                                            className="ai-suggestion"
                                            onClick={() =>
                                                handleSuggestedQuestion(
                                                    suggestion
                                                )
                                            }
                                            disabled={loading}
                                        >

                                            <span>
                                                {suggestion}
                                            </span>

                                            <span className="ai-suggestion-arrow">
                                                →
                                            </span>

                                        </button>

                                    )
                                )}

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        MESSAGES
                    ================================================== */}

                    {messages.map((message) => (

                        <div
                            key={message.id}
                            className={`ai-message-row ${
                                message.role === "user"
                                    ? "user-message-row"
                                    : "assistant-message-row"
                            }`}
                        >

                            {/* Assistant icon */}
                            {message.role === "assistant" && (

                                <div className="ai-message-avatar assistant-avatar">
                                    <Sparkles size={15} />
                                </div>

                            )}


                            <div
                                className={`ai-message ${
                                    message.role === "user"
                                        ? "user-message"
                                        : "assistant-message"
                                }`}
                            >

                                {message.role === "user" ? (

                                    <p>
                                        {message.content}
                                    </p>

                                ) : (

                                    <div className="ai-message-markdown">

                                        <ReactMarkdown
                                            remarkPlugins={[
                                                remarkGfm,
                                            ]}
                                            components={{
                                                table: ({ children }) => (
                                                    <div className="ai-message-markdown-table-wrapper">
                                                        <table>
                                                            {children}
                                                        </table>
                                                    </div>
                                                ),
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>

                                    </div>

                                )}

                            </div>


                            {/* User icon */}
                            {message.role === "user" && (

                                <div className="ai-message-avatar user-avatar">
                                    <User size={15} />
                                </div>

                            )}

                        </div>

                    ))}


                    {/* Loading */}
                    {loading && (

                        <div className="ai-message-row assistant-message-row">

                            <div className="ai-message-avatar assistant-avatar">
                                <Sparkles size={15} />
                            </div>


                            <div className="ai-message assistant-message ai-typing">

                                <div className="ai-typing-dots">
                                    <span />
                                    <span />
                                    <span />
                                </div>

                                <span>
                                    Analyzing your analytics...
                                </span>

                            </div>

                        </div>

                    )}


                    {/* Error */}
                    {error && (

                        <div className="ai-chat-error">

                            {error}

                        </div>

                    )}


                    <div ref={messagesEndRef} />

                </div>


                {/* =====================================================
                    FOOTER / INPUT
                ====================================================== */}

                <div className="ai-chat-footer">

                    {messages.length > 0 && (

                        <div className="ai-chat-toolbar">

                            <button
                                type="button"
                                onClick={handleClearChat}
                                disabled={loading}
                            >
                                <RotateCcw size={14} />

                                New conversation
                            </button>

                        </div>

                    )}


                    <div className="ai-chat-input-wrapper">

                        <input
                            ref={inputRef}
                            type="text"
                            value={question}
                            onChange={(event) =>
                                setQuestion(
                                    event.target.value
                                )
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your analytics..."
                            disabled={loading}
                            maxLength={500}
                        />


                        <button
                            type="button"
                            className="ai-send-button"
                            onClick={() => handleAskAI()}
                            disabled={
                                loading ||
                                !question.trim()
                            }
                            aria-label="Send question"
                        >
                            <Send size={17} />
                        </button>

                    </div>


                    <div className="ai-chat-disclaimer">

                        <Sparkles size={12} />

                        <span>
                            Based on current PanelSphere analytics
                        </span>

                    </div>

                </div>

            </aside>
        </>
    );
}