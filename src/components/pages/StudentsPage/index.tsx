import { Box, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';

import { ClassroomProps, currentTime } from '@utils/classrooms';
import { SocketContext } from '@contexts/SocketContext';
import { UserContext } from '@contexts/UserContext';
import Chatbox from './Chatbox';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function StudentsPage({ classroomName }: ClassroomProps) {
  const socket = useContext(SocketContext);
  const { user } = useContext(UserContext);
  const { name } = user;
  console.log('Student socketId:', socket?.id ?? 'No socket found');

  const [chatInSession, setChatInSession] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [removedFromClass, setRemovedFromClass] = useState(false);
  const [chat, setChat] = useState({
    you: '',
    peer: '',
    initialChar: '',
    conversation: [
      // ['you', 'vampire', 'i need blood'],
      // ['peer', 'wizard', 'i will cast a spell to make some'],
    ],
    startTime: '',
  });

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url, { shallow }) => {
      socket.emit('user disconnected');
    };
    router.events.on('routeChangeStart', handleRouteChange);

    if (socket) {
      socket.on('disconnect', () => {
        setReconnecting(true);
        setChatInSession(false);
      });

      socket.on('connect', () => {
        setReconnecting(false);
      });

      socket.on('chat start', ({ yourCharacter, peersCharacter, messages }) => {
        // reconstruct stored messages from the server if any
        const convo = messages
          ? messages.map((msg) => {
              const { character, message } = msg;
              if (character === yourCharacter)
                return ['you', character, message];
              return ['peer', character, message];
            })
          : [];
        setChat({
          you: yourCharacter,
          peer: peersCharacter,
          initialChar: yourCharacter,
          conversation: convo,
          startTime: currentTime(),
        });
        setChatInSession(true);
        setReconnecting(false);
      });

      socket.on('remove student from classroom', () => {
        setRemovedFromClass(true);
        setChatInSession(false);
      });

      socket.emit('new student entered', { realName: name, classroomName });
    }

    return () => {
      if (socket) {
        socket.off('disconnect');
        socket.off('connect');
        socket.off('chat start');
        socket.off('remove student from classroom');
        router.events.off('routeChangeStart', handleRouteChange);
      }
    };
  }, [classroomName, name, router.events, socket, reconnecting]);

  return (
    <main>
      <Typography variant='h4' sx={{ color: 'white', mb: 4 }}>
        {removedFromClass
          ? 'Your teacher has removed you from the classroom'
          : `Hello ${name}! Welcome to your classroom: ${classroomName}`}
      </Typography>

      {reconnecting && (
        <Typography variant='h5' sx={{ color: 'white', mb: 4 }}>
          Reconnecting... Please wait
        </Typography>
      )}

      {chatInSession && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Chatbox socket={socket} chat={chat} setChat={setChat} />
        </Box>
      )}
    </main>
  );
}
