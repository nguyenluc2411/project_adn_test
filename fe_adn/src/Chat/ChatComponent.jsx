import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../Context/AuthContext';
import axiosClient from '../config/AxiosClient';
import './ChatComponent.css';

const ChatComponent = ({ userRole, targetUserId, targetUserName, roomId }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [targetId, setTargetId] = useState(targetUserId || null);
  const [targetName, setTargetName] = useState(targetUserName || '');


  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && user?.id) {
      initializeChat();
    }

    return () => {
      if (stompClient.current?.connected) {
        stompClient.current.deactivate();
      }
    };
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateRoomId = (id1, id2) => {
    const smaller = Math.min(Number(id1), Number(id2));
    const larger = Math.max(Number(id1), Number(id2));
    return `room_${smaller}_${larger}`;
  };

  const initializeChat = async () => {
    try {
      setIsLoading(true);

      let customerId, staffId, staffName;

      if (userRole === 'CUSTOMER') {
        customerId = user.id;

        // 1. Kiểm tra đã có phòng với staff nào chưa
        try {
          const res = await axiosClient.get('/api/v1/rooms/staff-of-customer');
          const room = res.data.result;
          staffId = room.staffId;
          staffName = room.staffName;
        } catch (err) {
          if (err.response?.status === 404) {
            // 2. Nếu chưa có thì gọi staff rảnh nhất
            const res = await axiosClient.get('/api/v1/rooms/assign-staff');
            const staff = res.data.result;
            staffId = staff.id;
            staffName = staff.fullName;
          } else {
            console.error("❌ Lỗi khi kiểm tra phòng:", err);
            return;
          }
        }
      } else {
        // Trường hợp là staff thì target chính là customer
        customerId = targetUserId;
        staffId = user.id;
        staffName = targetUserName;
        setTargetId(targetUserId);
        setTargetName(targetUserName);
      }

      // 3. Gọi API tạo phòng hoặc lấy lại nếu đã tồn tại
      const room = await createOrGetRoom(customerId, staffId);
      const roomId = room?.roomId;
      if (!roomId) throw new Error("❌ Không nhận được roomId từ backend");

      // 4. Lưu lại tên nếu là customer (từ backend)
      if (userRole === 'CUSTOMER') {
        setTargetId(staffId);
        setTargetName(staffName);
      }

      await loadMessages(roomId);
      connectWebSocket(roomId);
      setCurrentRoom(roomId);

    } catch (error) {
      console.error('❌ Error initializing chat:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const createOrGetRoom = async (customerId, staffId) => {
    try {
      console.log("Gửi tạo phòng với:", { customerId, staffId });
      const res = await axiosClient.post('/api/v1/rooms', { customerId, staffId });
      if (!res?.data?.result) throw new Error("Không nhận được room từ backend");
      return res.data.result;
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.message?.includes("Room already exists")) {
        const roomId = generateRoomId(customerId, staffId);
        const res = await axiosClient.get(`/api/v1/rooms/${roomId}`);
        return res?.data?.result;
      }
      console.error('Error creating room:', error);
      throw error;
    }
  };

  const connectWebSocket = (roomId) => {
    const socket = new SockJS('http://localhost:8080/ws');

    stompClient.current = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        token: 'Bearer ' + localStorage.getItem('accessToken'),
      },
      debug: (str) => console.log('STOMP Debug:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.current.onConnect = () => {
      console.log('✅ Connected to WebSocket');
      setIsConnected(true);

      stompClient.current.subscribe(`/topic/room/${roomId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, receivedMessage]);
      });
    };

    stompClient.current.onStompError = (frame) => {
      console.error('❌ STOMP Error:', frame);
      setIsConnected(false);
    };

    stompClient.current.onDisconnect = () => {
      console.log('🔌 Disconnected from WebSocket');
      setIsConnected(false);
    };

    stompClient.current.activate();
  };


  const loadMessages = async (roomId) => {
    try {
      const res = await axiosClient.get(`/api/v1/rooms/${roomId}/messages`, {
        params: { page: 0, size: 50 },
      });

      if (res.data?.result?.length) {
        // Vì API trả từ mới → cũ
        setMessages(res.data.result.reverse());
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };


  const sendMessage = () => {
    if (!newMessage.trim() || !stompClient.current?.connected || !currentRoom) return;

    const messageObj = {
      content: newMessage.trim(),
      roomId: currentRoom,
    };

    stompClient.current.publish({
      destination: `/app/sendMessage/${currentRoom}`,
      body: JSON.stringify(messageObj),
    });

    setNewMessage('');
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  if (!user) return null;

  return (
    <>
      <button className="chat-toggle-btn" onClick={toggleChat} title={`Chat với ${targetName}`}>
        💬
      </button>

      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-header-info">
              <span className={isConnected ? 'online-status' : 'offline-status'}></span>
              <h4>{targetName}</h4>
            </div>
            <button className="minimize-btn" onClick={toggleChat}>−</button>
          </div>

          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
          </div>

          <div className="chat-messages">
            {isLoading ? (
              <div className="loading-indicator">Đang tải tin nhắn...</div>
            ) : (
              <>
                {messages.length === 0 ? (
                  <div className="no-messages">Chưa có tin nhắn nào</div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                      <div className="message-content">{msg.content}</div>
                      <div className="message-time">{formatMessageTime(msg.timeStamp)}</div>
                    </div>
                  ))
                )}

                {isTyping && (
                  <div className="typing-indicator">
                    <span className="typing-dots">Đang nhập...</span>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              disabled={!isConnected}
            />
            <button onClick={sendMessage} disabled={!newMessage.trim() || !isConnected}>
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatComponent;