import { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};


export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Remove useSocket from this file to comply with Fast Refresh requirements.