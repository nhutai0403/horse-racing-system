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
        { sender: 'AI', message: 'Xin chào! Tôi là Trợ lý ảo AI của hệ thống. Tôi có thể giúp gì cho bạn?', createdAt: new Date().toISOString() }
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
      const aiReply = res?.text || "Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi này.";
      
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
        message: err.message || "Không thể kết nối đến máy chủ AI lúc này.",
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch sử trò chuyện này?")) {
      try {
        await clearChatHistoryAPI();
        setMessages([
          { sender: 'AI', message: 'Đã xóa lịch sử trò chuyện. Tôi có thể giúp gì thêm cho bạn?', createdAt: new Date().toISOString() }
        ]);
      } catch (err) {
        alert("Xóa lịch sử chat thất bại: " + err.message);
      }
    }
  };

  const suggestions = [
    "Làm sao để tôi nạp tiền?",
    "Tôi muốn nâng cấp lên vai trò Chủ Ngựa?",
    "Làm sao để cược cuộc đua?",
    "Rút tiền mất bao lâu?"
  ];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '900px' }}>
      
      {/* Title */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <span className="role-badge">AI CHATBOT</span>
          <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">Trợ Lý Ảo AI</h2>
          <p className="text-secondary small">Giải đáp các câu hỏi nghiệp vụ, luật đua, cách thức nạp/rút tiền và cá cược.</p>
        </div>
        <button 
          onClick={handleClearHistory} 
          className="ho-btn ho-btn-outline-danger btn-sm"
          style={{ fontSize: '11px', textTransform: 'none', padding: '6px 12px' }}
        >
          Xóa lịch sử chat
        </button>
      </div>

      {/* Chat Box */}
      <div className="chat-window">
        <div className="chat-header">
          <span className="material-symbols-outlined">smart_toy</span>
          <span>Trợ Lý Đua Ngựa AI</span>
        </div>

        <div className="chat-messages-container">
          {loadingHistory ? (
            <div className="text-center my-auto">
              <div className="spinner-border spinner-border-sm text-success" role="status"></div>
              <p className="text-secondary small mt-2">Đang tải lịch sử chat...</p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isUser = m.sender === 'USER';
              return (
                <div 
                  key={idx}
                  className={`chat-bubble ${isUser ? 'user' : 'ai'}`}
                >
                  <div className="message-content">{m.message}</div>
                  <div className="chat-bubble-meta">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
          
          {sending && (
            <div className="chat-bubble ai">
              <div className="d-flex align-items-center gap-1 py-1">
                <span className="spinner-grow spinner-grow-sm text-success" role="status"></span>
                <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ animationDelay: '0.2s' }}></span>
                <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ animationDelay: '0.4s' }}></span>
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
            placeholder="Nhập câu hỏi của bạn tại đây..."
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
