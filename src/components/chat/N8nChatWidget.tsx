import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  ExternalLink, 
  Settings, 
  RotateCcw, 
  Loader2, 
  Copy, 
  Check, 
  Minimize2, 
  Maximize2,
  ChevronDown,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'n8n' | 'rythu-ai-fallback';
}

const DEFAULT_WEBHOOK_URL = 'https://hemamalini.app.n8n.cloud/webhook/a7558939-1091-4d6c-b403-fe67555bf35e/chat';
const STORAGE_KEY_WEBHOOK = 'rythu_n8n_webhook_url';
const STORAGE_KEY_CHAT_HISTORY = 'rythu_n8n_chat_history_v1';

export const N8nChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_WEBHOOK) || DEFAULT_WEBHOOK_URL;
  });
  const [tempWebhookUrl, setTempWebhookUrl] = useState(webhookUrl);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [sessionId] = useState(() => `rythu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CHAT_HISTORY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
    return [
      {
        id: 'msg_welcome',
        sender: 'assistant',
        text: 'నమస్కారం! Welcome to the Rythu Bazaar AI Assistant. Connected to your n8n workflow webhook.\n\nAsk me anything about vegetable surplus listings, AI freshness grades, nearby NGOs & community kitchens, or pickup OTP tracking!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'n8n',
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Persist chat history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHAT_HISTORY, JSON.stringify(messages));
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Listen to open-n8n-chat custom events from Navbar or elsewhere
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('open-n8n-chat', handleOpenEvent);
    return () => window.removeEventListener('open-n8n-chat', handleOpenEvent);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    let assistantResponseText = '';
    let responseSource: 'n8n' | 'rythu-ai-fallback' = 'n8n';

    try {
      // Step 1: Try proxy endpoint first to bypass any client-side CORS restriction
      const proxyRes = await fetch('/api/chat/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: text,
          message: text,
          sessionId,
          webhookUrl,
        }),
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        assistantResponseText = data.output || data.message || data.text || 'Message processed successfully.';
        responseSource = data.source || 'n8n';
      } else {
        throw new Error(`Proxy error ${proxyRes.status}`);
      }
    } catch (err: any) {
      console.warn('Proxy route failed, trying direct client-side n8n fetch...', err);
      
      // Step 2: Try direct fetch to n8n webhook
      try {
        const directRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
          },
          body: JSON.stringify({
            chatInput: text,
            message: text,
            action: 'sendMessage',
            sessionId,
          }),
        });

        if (directRes.ok) {
          const contentType = directRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await directRes.json();
            assistantResponseText = data.output || data.message || data.text || JSON.stringify(data);
          } else {
            assistantResponseText = await directRes.text();
          }
          responseSource = 'n8n';
        } else {
          assistantResponseText = getLocalAiFallback(text, webhookUrl);
          responseSource = 'rythu-ai-fallback';
        }
      } catch (directErr: any) {
        console.warn('Direct n8n fetch also failed:', directErr);
        assistantResponseText = getLocalAiFallback(text, webhookUrl);
        responseSource = 'rythu-ai-fallback';
      }
    } finally {
      setIsLoading(false);
      const assistantMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant',
        text: assistantResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: responseSource,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }
  };

  const getLocalAiFallback = (query: string, url: string): string => {
    const q = query.toLowerCase();
    if (q.includes('tomato') || q.includes('టమాట')) {
      return "🍅 Tomatoes at Rythu Bazaar: Desi Country Tomatoes have a shelf-life of 24-36h. Fresh batches are matched with Annapurna Daily Meals and Robin Hood Army. Ripe/soft batches are redirected for dinner curries or puree processing.";
    }
    if (q.includes('palak') || q.includes('methi') || q.includes('leafy') || q.includes('greens')) {
      return "🥬 Leafy Greens (Palak, Methi, Gongura): High perishability (8-12 hours). The AI Matcher prioritizes nearby hostels and community kitchens for dinner batches, or Sri Krishna Gaushala for cattle roughage if graded Critical (<4h).";
    }
    if (q.includes('otp') || q.includes('pickup') || q.includes('driver')) {
      return "🚚 Pickup OTP Verification: Once a match is accepted, an OTP code is generated in the portal (e.g. 5821). The driver or volunteer shares this OTP with the stall farmer upon collection to verify handover.";
    }
    if (q.includes('price') || q.includes('cost') || q.includes('money')) {
      return "💰 Price Recovery: Farmers can offer 100% Free Donation or nominal recovery (e.g. ₹8-₹12/kg vs retail ₹35/kg) to recoup transport expenses while preventing food waste.";
    }
    return `🌱 Rythu AI Assistant: Received your query! Your n8n webhook (${url}) is connected. You can ask about vegetable shelf-life, active pickup OTPs, matching logic, or recipient guidelines.`;
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    if (confirm('Clear chat conversation?')) {
      const resetMsg: ChatMessage[] = [
        {
          id: 'msg_welcome',
          sender: 'assistant',
          text: 'Conversation reset. Ready for your questions!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'n8n',
        },
      ];
      setMessages(resetMsg);
      localStorage.removeItem(STORAGE_KEY_CHAT_HISTORY);
    }
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tempWebhookUrl.trim();
    if (clean) {
      setWebhookUrl(clean);
      localStorage.setItem(STORAGE_KEY_WEBHOOK, clean);
      setShowSettings(false);
    }
  };

  const resetDefaultWebhook = () => {
    setTempWebhookUrl(DEFAULT_WEBHOOK_URL);
    setWebhookUrl(DEFAULT_WEBHOOK_URL);
    localStorage.setItem(STORAGE_KEY_WEBHOOK, DEFAULT_WEBHOOK_URL);
    setShowSettings(false);
  };

  const quickPrompts = [
    '🍅 How are tomato matches scored?',
    '🥬 Who accepts wilting palak/greens?',
    '🚚 How does pickup OTP work?',
    '💰 How does price recovery help farmers?',
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-5 right-5 z-50 group flex items-center gap-2.5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white px-4 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-500/30"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-emerald-800 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-emerald-800" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-extrabold tracking-tight block leading-tight">
              AI Assistant
            </span>
            <span className="text-[10px] text-emerald-200 block font-medium">
              n8n Chat Webhook
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 z-50 w-[94vw] sm:w-[420px] bg-white rounded-3xl shadow-2xl border border-gray-200/90 flex flex-col overflow-hidden transition-all duration-200 ${
            isMinimized ? 'h-16' : 'h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-700/80 border border-emerald-500/40 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold truncate">Rythu AI Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Online" />
                </div>
                <p className="text-[10px] text-emerald-200 truncate flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300 inline" />
                  <span>n8n Webhook: hemamalini.app.n8n.cloud</span>
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 shrink-0 text-emerald-200">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 hover:text-white hover:bg-emerald-800/60 rounded-lg transition"
                title="Webhook Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:text-white hover:bg-emerald-800/60 rounded-lg transition"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-emerald-800/60 rounded-lg transition"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Webhook Configuration Drawer */}
              {showSettings && (
                <div className="bg-emerald-50/90 border-b border-emerald-200 p-3.5 text-xs animate-in slide-in-from-top duration-150">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-700" />
                      n8n Webhook Endpoint
                    </span>
                    <a
                      href={webhookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <form onSubmit={handleSaveWebhook} className="space-y-2">
                    <input
                      type="url"
                      value={tempWebhookUrl}
                      onChange={(e) => setTempWebhookUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 text-xs font-mono bg-white text-gray-800 focus:ring-1 focus:ring-emerald-500"
                      placeholder="https://..."
                    />
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={resetDefaultWebhook}
                        className="text-[11px] text-gray-500 hover:text-gray-800 underline"
                      >
                        Reset Default
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowSettings(false)}
                          className="px-2.5 py-1 rounded-md text-gray-600 hover:bg-gray-200 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-bold"
                        >
                          Save URL
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Chat Message Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 group ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 shadow-xs mt-0.5">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isUser
                            ? 'bg-emerald-700 text-white rounded-tr-xs'
                            : 'bg-white text-gray-800 border border-gray-200/80 rounded-tl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-black/5 text-[10px] opacity-75">
                          <span className={isUser ? 'text-emerald-100' : 'text-gray-400'}>
                            {msg.timestamp}
                          </span>

                          <button
                            onClick={() => copyToClipboard(msg.id, msg.text)}
                            className="opacity-0 group-hover:opacity-100 transition p-0.5 rounded hover:bg-black/10"
                            title="Copy text"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 shadow-xs mt-0.5">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[11px] text-gray-400 ml-1">n8n is thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Bar */}
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium border border-emerald-200 transition shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-white border-t border-gray-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask AI about vegetable surplus, OTP, matching..."
                    disabled={isLoading}
                    className="flex-1 px-3.5 py-2.5 bg-gray-100/80 hover:bg-gray-100 focus:bg-white rounded-xl text-xs text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />

                  <button
                    type="button"
                    onClick={clearChat}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition"
                    title="Clear history"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 text-white rounded-xl shadow-xs transition flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 px-1">
                  <span>Connected: n8n webhook /chat</span>
                  <span>Rythu Bazaar AI &bull; Zero Waste</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
