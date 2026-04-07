// Chatbot context — shared state across widget & engine
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSignup } from '../../contexts/SignupContext';
import { usePremium } from '../../contexts/PremiumContext';

const ChatbotContext = createContext(null);

const SESSION_KEY = 'edu_chatbot_session';
export const GUEST_TURN_LIMIT = 4; // free turns before soft sign-up prompt

export function ChatbotProvider({ children }) {
    const { user, isSignedUp, openSignUp } = useSignup();
    const { isPremium } = usePremium();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [guestTurns, setGuestTurns] = useState(0);
    const [flow, setFlow] = useState(null);
    const [flowData, setFlowData] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const role = isPremium ? 'premium' : isSignedUp ? 'free' : 'guest';

    // Restore session
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(SESSION_KEY);
            if (saved) {
                const { messages: m, guestTurns: gt, flow: f, flowData: fd } = JSON.parse(saved);
                if (m?.length) {
                    setMessages(m);
                    setGuestTurns(gt || 0);
                    setFlow(f || null);
                    setFlowData(fd || {});
                }
            }
        } catch { /* ignore */ }
        setInitialized(true);
    }, []);

    // Persist session
    useEffect(() => {
        if (!initialized || !messages.length) return;
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({ messages, guestTurns, flow, flowData }));
        } catch { /* ignore */ }
    }, [messages, guestTurns, flow, flowData, initialized]);

    const addMessage = useCallback((msg) => {
        setMessages(prev => [...prev, { ...msg, id: Date.now() + Math.random(), timestamp: new Date().toISOString() }]);
    }, []);

    const botSay = useCallback((content, extra = {}) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                role: 'bot',
                content,
                timestamp: new Date().toISOString(),
                ...extra,
            }]);
        }, extra.delay || 800);
    }, []);

    // Guest may continue if they haven't hit the limit; signed-in users always can
    const canContinue = useCallback(() => {
        if (isSignedUp) return true;
        return guestTurns < GUEST_TURN_LIMIT;
    }, [isSignedUp, guestTurns]);

    const incrementGuestTurn = useCallback(() => {
        if (!isSignedUp) setGuestTurns(prev => prev + 1);
    }, [isSignedUp]);

    const turnsLeft = isSignedUp ? Infinity : Math.max(0, GUEST_TURN_LIMIT - guestTurns);

    const resetChat = useCallback(() => {
        setMessages([]);
        setFlow(null);
        setFlowData({});
        setGuestTurns(0);
        sessionStorage.removeItem(SESSION_KEY);
    }, []);

    const openChat = useCallback(() => setIsOpen(true), []);

    return (
        <ChatbotContext.Provider value={{
            isOpen, setIsOpen, openChat,
            messages, addMessage, botSay,
            guestTurns, incrementGuestTurn, canContinue, turnsLeft,
            flow, setFlow,
            flowData, setFlowData,
            isTyping,
            role, isSignedUp, user, openSignUp,
            resetChat,
            initialized,
        }}>
            {children}
        </ChatbotContext.Provider>
    );
}

export const useChatbot = () => {
    const ctx = useContext(ChatbotContext);
    if (!ctx) throw new Error('useChatbot must be used inside ChatbotProvider');
    return ctx;
};
