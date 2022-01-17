/** @jsxImportSource @emotion/react */

import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import Filter from 'bad-words';

import conversationCSS from './Conversation.css';

export default function Conversation({ socket, chat, setChat, scrollDown }) {
  function filterWords(words) {
    const filter = new Filter();
    try {
      return filter.clean(words);
      // the filter throws an error if the string only has non-letter characters
    } catch (e) {
      return words;
    }
  }

  useEffect(() => {
    if (socket) {
      socket.on('chat message', ({ character, message }) => {
        setChat((chat) => ({
          ...chat,
          conversation: [...chat.conversation, ['peer', character, message]],
        }));
        scrollDown();
      });
    }

    return () => {
      if (socket) {
        socket.off('chat message');
      }
    };
  }, []);

  return (
    <Box>
      <Box css={conversationCSS.introText}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            Hi <span css={conversationCSS.you}>{chat.initialChar}</span>
          </span>
          <span>{chat.startTime || '3:05pm'}</span>
        </Box>
        <span>You matched with </span>
        <span css={conversationCSS.peer}>{chat.peer}</span>
      </Box>
      {chat.conversation.map(([person, character, message], i) => {
        let fontCSS = {};
        if (person === 'peer') fontCSS = conversationCSS.peer;
        else if (person === 'you') fontCSS = conversationCSS.you;

        return (
          <Typography key={i}>
            <span css={fontCSS}>{filterWords(character)}: </span>
            <span>{filterWords(message)}</span>
          </Typography>
        );
      })}
    </Box>
  );
}