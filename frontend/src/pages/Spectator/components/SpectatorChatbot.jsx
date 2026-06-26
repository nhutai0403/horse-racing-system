import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessageAPI, getChatHistoryAPI, clearChatHistoryAPI } from '../../../services/aiChat';
import '../Spectator.css';

export default function SpectatorChatbot() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const loadHistory = async () => {
    try {
      const data = await getChatHistoryAPI();
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load chat history", err);
      // Fallback message if error
      setMessages([
        { sender: 'AI', message: 'Hello! I am your AI assistant. How can I help you today?', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || text.trim() === '') return;

    if (!textToSend) setInputText('');

    // Append user message locally
    const userMsg = {
      sender: 'USER',
      message: text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await sendChatMessageAPI(text);
      const aiReply = res?.text || "Sorry, I encountered an issue processing your request.";
      
      const aiMsg = {
        sender: 'AI',
        message: aiReply,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Failed to get chatbot response", err);
      const errorMsg = {
        sender: 'AI',
        message: err.message || "Unable to connect to AI server at the moment.",
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear this chat history?")) {
      try {
        await clearChatHistoryAPI();
        setMessages([
          { sender: 'AI', message: 'Chat history cleared. How else can I help you?', createdAt: new Date().toISOString() }
        ]);
      } catch (err) {
        alert("Failed to clear chat history: " + err.message);
      }
    }
  };

  const suggestions = [
    "How do I deposit funds?",
    "How do I upgrade to Horse Owner role?",
    "How do I place a bet?",
    "How long do withdrawals take?"
  ];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '900px' }}>
      
      {/* Title */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <span className="role-badge">AI CHATBOT</span>
          <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">AI Virtual Assistant</h2>
          <p className="text-secondary small">Ask questions about operations, racing rules, deposits/withdrawals, and betting.</p>
        </div>
        <button 
          onClick={handleClearHistory} 
          className="ho-btn ho-btn-outline-danger btn-sm"
          style={{ fontSize: '11px', textTransform: 'none', padding: '6px 12px' }}
        >
          Clear Chat History
        </button>
      </div>

      {/* Chat Box */}
      <div className="chat-window">
        <div className="chat-header">
          <div className="rounded-circle overflow-hidden border border-warning me-2" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
            <img 
              src="https://images.unsplash.com/photo-1598974357801-ae6e44f80698?w=80&auto=format&fit=crop&q=80" 
              alt="Horse AI Agent" 
              className="w-100 h-100 object-fit-cover" 
            />
          </div>
          <span>AI Horse Assistant</span>
        </div>

        <div className="chat-messages-container">
          {loadingHistory ? (
            <div className="text-center my-auto">
              <div className="spinner-border spinner-border-sm text-success" role="status"></div>
              <p className="text-secondary small mt-2">Loading chat history...</p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isUser = m.sender === 'USER';
              return (
                <div 
                  key={idx}
                  className={`d-flex ${isUser ? 'justify-content-end' : 'justify-content-start'} align-items-end gap-2 mb-2`}
                >
                  {/* AI Avatar */}
                  {!isUser && (
                    <div className="rounded-circle overflow-hidden border border-success" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                      <img 
                        src="https://images.unsplash.com/photo-1598974357801-ae6e44f80698?w=80&auto=format&fit=crop&q=80" 
                        alt="AI Avatar" 
                        className="w-100 h-100 object-fit-cover" 
                      />
                    </div>
                  )}

                  <div className={`chat-bubble ${isUser ? 'user' : 'ai'}`}>
                    <div className="message-content">{m.message}</div>
                    <div className="chat-bubble-meta">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div 
                      className="rounded-circle overflow-hidden border d-flex align-items-center justify-content-center bg-success text-white fw-bold" 
                      style={{ width: '32px', height: '32px', flexShrink: 0, fontSize: '11px' }}
                    >
                      U
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          {sending && (
            <div className="d-flex justify-content-start align-items-end gap-2 mb-2">
              <div className="rounded-circle overflow-hidden border border-success" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                <img 
                  src="https://images.unsplash.com/photo-1598974357801-ae6e44f80698?w=80&auto=format&fit=crop&q=80" 
                  alt="AI Avatar" 
                  className="w-100 h-100 object-fit-cover" 
                />
              </div>
              <div className="chat-bubble ai">
                <div className="d-flex align-items-center gap-1 py-1">
                  <span className="spinner-grow spinner-grow-sm text-success" role="status"></span>
                  <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ animationDelay: '0.2s' }}></span>
                  <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Bubbles */}
        <div className="chat-suggestions">
          {suggestions.map((text, idx) => (
            <button 
              key={idx} 
              type="button" 
              onClick={() => handleSend(text)}
              className="chat-suggestion-btn"
              disabled={sending}
            >
              {text}
            </button>
          ))}
        </div>

        {/* Input area */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
          className="chat-input-container"
        >
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Type your question here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
          />
          <button 
            type="submit" 
            className="chat-send-btn"
            disabled={sending || !inputText.trim()}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>

    </div>
  );
}
