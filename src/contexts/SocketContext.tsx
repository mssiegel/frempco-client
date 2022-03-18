import { createContext } from 'react';
import { io } from 'socket.io-client';
import { getUniqueID } from '@utils/classrooms';

interface ProviderProps {
  children: React.ReactNode;
}

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
const token = getUniqueID();

const socket = io(SERVER_URL, { query: { token } });

const SocketContext = createContext(socket);

function SocketProvider({ children }: ProviderProps) {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export { SocketContext, SocketProvider };
