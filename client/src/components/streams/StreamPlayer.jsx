import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

export default function StreamPlayer() {
  const { streamId } = useParams();
  const videoRef = useRef(null);
  const socket = useSocket();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.emit('joinStream', streamId);
      socket.on('newMessage', (message) => {
        setMessages((prev) => [...prev, message]);
      });
    }

    return () => {
      socket?.off('newMessage');
    };
  }, [socket, streamId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const message = e.target.message.value;
    if (message.trim()) {
      socket.emit('sendMessage', { streamId, message });
      e.target.reset();
    }
  };

  return (
    <div className="flex">
      <div className="w-3/4">
        <video
          ref={videoRef}
          controls
          autoPlay
          className="w-full"
          src={`http://localhost:5000/live/${streamId}.m3u8`} // HLS stream
        />
      </div>
      <div className="w-1/4 p-4">
        <div className="h-96 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
        <form onSubmit={handleSendMessage}>
          <input name="message" placeholder="Type a message" />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}