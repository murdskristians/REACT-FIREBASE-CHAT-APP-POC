import { PuiBox, PuiStack } from 'piche.ui';
import { FC, useEffect, useRef } from 'react';

import type { ConversationMessage } from '../../../firebase/conversations';
import type { Contact } from '../../../firebase/users';
import { MessageCard } from './MessageCard';

interface MessageListProps {
  messages: ConversationMessage[];
  currentUserId: string;
  isGroup?: boolean;
  contactsMap: Map<string, Contact>;
}

export const MessageList: FC<MessageListProps> = ({ messages, currentUserId, isGroup = false, contactsMap }) => {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <PuiBox
      ref={listRef}
      className="messages-container"
      sx={{
        position: 'relative',
        flexGrow: 1,
        overflowY: 'auto',
        height: '100%',
        paddingBottom: '24px',
      }}
    >
      <PuiStack
        sx={{
          width: '100%',
          maxWidth: '1040px',
          margin: 'auto',
          gap: '4px',
        }}
      >
        {messages.length === 0 ? (
          <PuiBox
            sx={{
              textAlign: 'center',
              color: '#939393',
              fontSize: '13px',
              marginTop: '40px',
            }}
          >
            No messages yet. Be the first to say hello.
          </PuiBox>
        ) : (
          messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const isUserMessage = message.senderId === currentUserId;
            const sequenceStarted =
              !prevMessage ||
              prevMessage.senderId !== message.senderId ||
              new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() >
                5 * 60 * 1000; // 5 minutes

            // Get sender's profile from contactsMap for consistent avatar
            const senderProfile = contactsMap.get(message.senderId);

            return (
              <MessageCard
                key={message.id}
                message={message}
                isUserMessage={isUserMessage}
                sequenceStarted={sequenceStarted}
                senderName={!isUserMessage ? (senderProfile?.displayName || message.senderName) : undefined}
                senderAvatar={!isUserMessage ? senderProfile?.avatarUrl : undefined}
                senderAvatarColor={!isUserMessage ? senderProfile?.avatarColor : undefined}
                isGroup={isGroup}
              />
            );
          })
        )}
      </PuiStack>
    </PuiBox>
  );
};
