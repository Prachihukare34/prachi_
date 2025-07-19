import React, { useEffect, useRef, useState } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const ws = new WebSocket('ws://localhost:8080');

export default function App() {
  const [usernameInput, setUsernameInput] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('🧑‍💻');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'message') {
        setMessages((prev) => [...prev, msg.data]);
      } else if (msg.type === 'history') {
        setMessages(msg.data);
      } else if (msg.type === 'typing') {
        setTypingUser(msg.user);
        setTimeout(() => setTypingUser(''), 1500);
      }
    };
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = () => {
    const hasEmojiOnly = /[\p{Emoji}]/u.test(input);
    if (!input.trim() && !hasEmojiOnly) return;
    ws.send(
      JSON.stringify({
        type: 'message',
        data: {
          user: username,
          avatar,
          text: input,
          timestamp: new Date().toISOString(),
        },
      })
    );
    setInput('');
  };

  const handleTyping = () => {
    ws.send(JSON.stringify({ type: 'typing', user: username }));
  };

  if (!username) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20%' }}>
        <h2>Enter Your Name</h2>
        <input
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          placeholder="Your name"
          style={{ padding: 10, fontSize: 16 }}
        />
        <div style={{ fontSize: 30, margin: 10 }}>
          {['🐱', '🐶', '🧑‍💻', '🤖', '👻'].map((em) => (
            <span
              key={em}
              style={{
                cursor: 'pointer',
                margin: 5,
                border: avatar === em ? '2px solid blue' : 'none',
              }}
              onClick={() => setAvatar(em)}
            >
              {em}
            </span>
          ))}
        </div>
        <button
          onClick={() => {
            if (usernameInput.trim()) {
              setUsername(usernameInput.trim());
            }
          }}
          style={{ padding: '8px 16px', fontSize: 16, cursor: 'pointer' }}
        >
          Start Chat
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', fontFamily: 'Arial' }}>
      <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
        {avatar} {username}
      </h3>

      <div
        ref={chatRef}
        style={{
          border: '1px solid #ccc',
          height: 400,
          overflowY: 'scroll',
          padding: 10,
          background: '#fff',
          borderRadius: 10,
        }}
      >
        {messages.map((msg, i) => {
          const isMe = msg.user === username;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                marginBottom: 10,
              }}
            >
              {!isMe && (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    fontSize: 22,
                    marginRight: 8,
                    textAlign: 'center',
                  }}
                >
                  {msg.avatar}
                </div>
              )}
              <div
                style={{
                  backgroundColor: isMe ? '#007bff' : '#f1f1f1',
                  color: isMe ? 'white' : '#222',
                  padding: '8px 12px',
                  borderRadius: 14,
                  maxWidth: '70%',
                  fontSize: 14,
                  lineHeight: 1.4,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {msg.user}
                  <span style={{ fontSize: 10, marginLeft: 8, color: '#ccc' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div>{msg.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      {typingUser && (
        <div style={{ fontStyle: 'italic', marginTop: 4 }}>
          {typingUser} is typing...
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleTyping}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '10px 12px',
            fontSize: 14,
            borderRadius: 20,
            border: '1px solid #ccc',
            outline: 'none',
          }}
        />
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          style={{
            fontSize: '18px',
            padding: '6px 10px',
            background: 'none',
            border: '1px solid #ccc',
            borderRadius: 10,
            marginLeft: 6,
            cursor: 'pointer',
          }}
        >
          😊
        </button>
        <button
          onClick={sendMessage}
          style={{
            marginLeft: 6,
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 20,
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>

      {showEmoji && (
        <div
          style={{
            position: 'fixed',
            bottom: 100,
            left: 20,
            zIndex: 1000,
          }}
        >
          <Picker
            data={data}
            theme="light"
            emojiSize={18}
            onEmojiSelect={(e) => {
              setInput((prev) => prev + e.native);
              document.querySelector('input').focus();
            }}
          />
        </div>
      )}
    </div>
  );
}
