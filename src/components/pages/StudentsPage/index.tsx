import { Box, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';

import { ClassroomProps, currentTime } from '@utils/classrooms';
import { SocketContext } from '@contexts/SocketContext';
import Chatbox from './Chatbox';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function StudentsPage({
  classroomName,
  student,
}: ClassroomProps) {
  const socket = useContext(SocketContext);
  console.log('Student socketId:', socket?.id ?? 'No socket found');

  const [chatInSession, setChatInSession] = useState(false);
  const [teacherLeft, setTeacherLeft] = useState(false);
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
      socket.on('chat start', ({ yourCharacter, peersCharacter }) => {
        setChat({
          you: yourCharacter,
          peer: peersCharacter,
          initialChar: yourCharacter,
          conversation: [],
          startTime: currentTime(),
        });
        setChatInSession(true);
      });

      socket.on('teacher left', () => {
        setChatInSession(false);
        setTeacherLeft(true);
      });
    }

    return () => {
      if (socket) {
        socket.off('chat start');
        router.events.off('routeChangeStart', handleRouteChange);
      }
    };
  });

  return (
    <main>
      <Typography variant='h4' sx={{ color: 'white', mb: 4 }}>
        Hello {student}! Welcome to your classroom: {classroomName}
      </Typography>
      {chatInSession && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Chatbox socket={socket} chat={chat} setChat={setChat} />
        </Box>
      )}
      {teacherLeft && (
        <Typography variant='h6' sx={{ color: 'white', mb: 4 }}>
          The Teacher Has Left. Return{' '}
          <Link href='/'>
            <a>Home</a>
          </Link>{' '}
          to start over.
        </Typography>
      )}
    </main>
  );
}
