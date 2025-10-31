import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // TODO: change

function ChatComponent() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    socket.on('message', (msg) => {
      console.log(msg);
    });

    socket.on('assistantResponse', (response) => {
      setResponse(response);
    });

    return () => {
      socket.off('message');
      socket.off('assistantResponse');
    };
  }, []);

  const sendMessage = () => {
    socket.emit('userMessage', message);
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask something..."
      />
      <button onClick={sendMessage}>Send</button>
      <p>Response: {response}</p>
    </div>
  );
}

export default ChatComponent;
