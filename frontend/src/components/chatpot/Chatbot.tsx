import { useState, useEffect, useRef } from 'react';
// import { useTranslation } from 'react-i18next';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2,
  Maximize2,
  Trash2,
  Globe
} from 'lucide-react';
import { api } from '../../lib/api';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
};

type SuggestedQuestion = {
  text: string;
  icon: string;
  textRw?: string; // Kinyarwanda version
};

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { text: "How to post a listing?", textRw: "Nigute utangaza?", icon: "📋" },
  { text: "What are subscription plans?", textRw: "Gahunda z'iyandikishwa?", icon: "💰" },
  { text: "Image requirements?", textRw: "Amabwiriza y'amashusho?", icon: "📸" },
  { text: "How long for approval?", textRw: "Igihe cyo kwemera?", icon: "⏰" },
  { text: "Contact support", textRw: "Twandikire ubufasha", icon: "📞" },
  { text: "Pricing and fees", textRw: "Ibiciro", icon: "💵" },
];

// Welcome messages by language
const WELCOME_MESSAGES = {
  en: "Hello! 👋 How can I help you with Market Hub today?",
  rw: "Muraho! 👋 Nigute nakugufasha kuri Market Hub uyumunsi?"
};

const ERROR_MESSAGES = {
  en: "Sorry, I encountered an error. Please try again.",
  rw: "Ibyabaye, habaye ikibazo. Nyamuneka ongerageze."
};

const CLEAR_CHAT_TEXTS = {
  en: "Clear chat",
  rw: "Hanagura ibiganiro"
};

const INPUT_PLACEHOLDERS = {
  en: "Type your message...",
  rw: "Andika ubutumwa..."
};

const SUGGESTED_TEXTS = {
  en: "Suggested questions:",
  rw: "Ibibazo bikunze kubazwa:"
};

export default function Chatbot() {
  // const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'rw'>('en'); // Language state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('chat_language') as 'en' | 'rw';
    console.log('🔍 [FRONTEND] Loading saved language from localStorage:', savedLanguage);
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'rw')) {
      setLanguage(savedLanguage);
      console.log('🔍 [FRONTEND] Language set to:', savedLanguage);
    } else {
      console.log('🔍 [FRONTEND] No saved language, using default: en');
    }
  }, []);

  // Save language preference
  const handleLanguageChange = (newLanguage: 'en' | 'rw') => {
    console.log('🔍 [FRONTEND] Language changing from', language, 'to', newLanguage);
    setLanguage(newLanguage);
    localStorage.setItem('chat_language', newLanguage);
    console.log('🔍 [FRONTEND] Language saved to localStorage:', newLanguage);
    
    // Optional: Add system message about language change
    setMessages(prev => [...prev, {
      role: 'system',
      content: newLanguage === 'en' ? 'Language changed to English' : 'Ururimi ryahinduwe mu Kinyarwanda'
    }]);
  };

  useEffect(() => {
    const stored = localStorage.getItem('chat_session_id');
    if (stored) {
      setSessionId(stored);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    console.log('🔍 [FRONTEND] sendMessage called with:', message);
    console.log('🔍 [FRONTEND] Current language state:', language);

    // Add user message to UI
    const userMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const requestBody = { 
        message: message,
        language: language  // Send language to backend
      };
      console.log('🔍 [FRONTEND] Sending to backend:', requestBody);
      
      const response = await api.post('/chatbot/chat/', 
        requestBody,
        { headers: sessionId ? { 'X-Session-ID': sessionId } : {} }
      );

      console.log('🔍 [FRONTEND] Response from backend:', response.data);
      console.log('🔍 [FRONTEND] Response language:', response.data.language);
      console.log('🔍 [FRONTEND] Response text:', response.data.response);

      // Save session ID
      if (response.data.session_id && !sessionId) {
        setSessionId(response.data.session_id);
        localStorage.setItem('chat_session_id', response.data.session_id);
      }

      // Add assistant response
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response.data.response 
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('🔍 [FRONTEND] Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: ERROR_MESSAGES[language]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    console.log('🔍 [FRONTEND] Clearing chat');
    if (sessionId) {
      try {
        await api.delete('/chatbot/chat/clear/', {
          headers: { 'X-Session-ID': sessionId }
        });
      } catch (error) {
        console.error('Clear chat error:', error);
      }
    }
    setMessages([]);
    localStorage.removeItem('chat_session_id');
    setSessionId(null);
    
    // Add welcome message in current language
    console.log('🔍 [FRONTEND] Adding welcome message in language:', language);
    setMessages([{
      role: 'assistant',
      content: WELCOME_MESSAGES[language]
    }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestedQuestion = (question: SuggestedQuestion) => {
    // Send question in appropriate language
    const questionText = language === 'rw' && question.textRw ? question.textRw : question.text;
    console.log('🔍 [FRONTEND] Suggested question clicked:', questionText);
    sendMessage(questionText);
  };

  // Welcome message on first open
  const handleOpen = () => {
    console.log('🔍 [FRONTEND] Chat opened, current language:', language);
    setIsOpen(true);
    setIsMinimized(false);
    if (messages.length === 0) {
      console.log('🔍 [FRONTEND] No messages, adding welcome message in:', language);
      setMessages([{
        role: 'assistant',
        content: WELCOME_MESSAGES[language]
      }]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-14 w-72' : 'h-[550px] w-[400px]'
      }`}
    >
      {/* Header with caption and language selector */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-white" />
            <div>
              <span className="font-semibold text-white">Market Hub Assistant</span>
              <p className="text-[10px] text-white/80">
                {language === 'en' ? 'Ask me anything about Market Hub' : 'Mbaza ikibazo cyose kuri Market Hub'}
              </p>
            </div>
            <span className="rounded-full bg-green-400 px-1.5 py-0.5 text-[10px] font-medium text-green-900">
              {language === 'en' ? 'Online' : 'Turi hano'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Language Switcher */}
            <button
              onClick={() => handleLanguageChange(language === 'en' ? 'rw' : 'en')}
              className="rounded bg-white/10 px-2 py-1 text-xs text-white transition hover:bg-white/20"
              title={language === 'en' ? 'Kinyarwanda' : 'English'}
            >
              <Globe size={14} className="inline mr-1" />
              {language === 'en' ? 'RW' : 'EN'}
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="rounded p-1 text-white/80 hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-white/80 hover:bg-white/20"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Bot size={48} className="text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">
                  {WELCOME_MESSAGES[language]}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : msg.role === 'system'
                          ? 'bg-gray-200 text-gray-500 text-xs'
                          : 'bg-white text-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {msg.role === 'assistant' && (
                          <Bot size={16} className="mt-0.5 text-indigo-500" />
                        )}
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                        {msg.role === 'user' && (
                          <User size={16} className="mt-0.5 text-white/70" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white px-4 py-2 shadow-sm">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.1s' }}></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Suggested Questions */}
          {messages.length < 3 && (
            <div className="border-t border-slate-100 bg-white p-3">
              <p className="mb-2 text-xs text-slate-500">{SUGGESTED_TEXTS[language]}</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-200"
                  >
                    <span className="mr-1">{q.icon}</span>
                    {language === 'rw' && q.textRw ? q.textRw : q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="mx-3 mb-2 flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-1.5 text-xs text-slate-500 transition hover:bg-slate-50"
            >
              <Trash2 size={12} />
              {CLEAR_CHAT_TEXTS[language]}
            </button>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={INPUT_PLACEHOLDERS[language]}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}