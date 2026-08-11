import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (accessToken) => {
  if (socket) return socket; // avoid duplicate connections

  socket = io('http://localhost:5000', {
    auth: { token: accessToken },
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;