import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaTimes, FaTrashAlt, FaPaperPlane } from 'react-icons/fa';
import { BsChatDotsFill } from 'react-icons/bs';
import { sendChatMessageAPI, getChatHistoryAPI, clearChatHistoryAPI } from '../../services/aiChat';
import { AuthContext } from '../../contexts/AuthContext';
import './FloatingAiChat.css';

export default function FloatingAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Load history when opening chat for the first time
  useEffect(() => {
    if (isOpen && user && messages.length === 0) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const history = await getChatHistoryAPI();
      // Lịch sử trả về có dạng: { sender: 'USER' | 'AI', message: '...' }
      setMessages(history.map(h => ({
        sender: h.sender === 'USER' ? 'USER' : 'AI',
        text: h.message
      })));
    } catch (error) {
      console.error('Không thể tải lịch sử:', error);
      // Nếu lỗi, cứ hiển thị mảng rỗng và một câu chào
      setMessages([{ sender: 'AI', text: 'Xin chào! Tôi là Trợ lý AI Horse Racing. Tôi có thể giúp gì cho bạn?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, { sender: 'USER', text: userMessage }]);
    setIsSending(true);

    try {
      const replyStr = await sendChatMessageAPI(userMessage);
      // API có thể trả về plain string hoặc object
      const aiReplyText = typeof replyStr === 'string' ? replyStr : (replyStr.response || replyStr.message || JSON.stringify(replyStr));
      setMessages(prev => [...prev, { sender: 'AI', text: aiReplyText }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'AI', text: 'Xin lỗi, đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau.' }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện không?')) return;
    
    try {
      setIsLoading(true);
      await clearChatHistoryAPI();
      setMessages([{ sender: 'AI', text: 'Lịch sử trò chuyện đã được xóa. Tôi có thể giúp gì cho bạn hôm nay?' }]);
    } catch (error) {
      alert('Không thể xóa lịch sử: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <div className="floating-chat-container">
      {isOpen && (
        <div className="floating-chat-window">
          <div className="chat-header">
            <h4><FaRobot /> Trợ lý AI</h4>
            <div className="chat-header-actions">
              {user && (
                <button 
                  className="chat-header-btn delete-btn" 
                  onClick={handleClearHistory}
                  title="Xóa lịch sử"
                >
                  <FaTrashAlt size={14} />
                </button>
              )}
              <button className="chat-header-btn" onClick={() => setIsOpen(false)}>
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="chat-body position-relative">
            {!user ? (
              <div className="auth-overlay">
                <FaRobot size={40} color="#d4af37" className="mb-3" />
                <p>Vui lòng đăng nhập để trò chuyện và lưu lịch sử với Trợ lý AI.</p>
                <button onClick={handleLoginRedirect}>Đăng nhập ngay</button>
              </div>
            ) : isLoading && messages.length === 0 ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {messages.length === 0 && !isLoading && (
                  <div className="chat-bubble ai">
                    Xin chào! Tôi là Trợ lý AI Horse Racing. Tôi có thể giúp gì cho bạn?
                  </div>
                )}
                {messages.map((msg, index) => (
                  <div key={index} className={`chat-bubble ${msg.sender === 'USER' ? 'user' : 'ai'}`}>
                    {msg.text}
                  </div>
                ))}
                {isSending && (
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <form className="chat-footer" onSubmit={handleSend}>
            <input 
              type="text" 
              className="chat-input"
              placeholder="Nhập tin nhắn..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={!user || isSending || isLoading}
            />
            <button 
              type="submit" 
              className="chat-send-btn"
              disabled={!user || !inputText.trim() || isSending || isLoading}
            >
              <FaPaperPlane size={14} />
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button 
          className="floating-chat-button" 
          onClick={() => setIsOpen(true)}
          title="Trò chuyện với AI"
        >
          <BsChatDotsFill />
        </button>
      )}
    </div>
  );
}
