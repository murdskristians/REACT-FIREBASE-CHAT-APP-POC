import { FormEvent, useEffect, useState } from 'react';
import type firebaseCompat from 'firebase/compat/app';

import { PuiDivider, PuiIcon, PuiStack, PuiSvgIcon, PuiTypography } from 'piche.ui';

import type { ConversationMessage } from '../../../firebase/conversations';
import type { ViewConversation } from '../Workspace';
import { ConversationInput } from './ConversationInput';
import { MessageList } from './MessageList';
import {
  ChatAreaWrapper,
  ConversationInfoWrapper,
  MessagesContainer,
  StyledTopBar,
  StyledTopBarButton,
} from './StyledComponents';

type ChatViewProps = {
  user: firebaseCompat.User;
  conversation: ViewConversation | null;
  messages: ConversationMessage[];
  onSendMessage: (payload: { text: string; file?: File | null }) => Promise<void>;
  isSending: boolean;
};

export function ChatView({ user, conversation, messages, onSendMessage, isSending }: ChatViewProps) {
  const [composerValue, setComposerValue] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    if (!conversation) {
      setComposerValue('');
      setPendingFile(null);
    }
  }, [conversation]);

  useEffect(() => {
    if (!messages.length) {
      setComposerValue('');
      setPendingFile(null);
    }
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!conversation) {
      return;
    }

    const text = composerValue.trim();
    if (!text && !pendingFile) {
      return;
    }

    await onSendMessage({ text, file: pendingFile });

    setComposerValue('');
    setPendingFile(null);
  };

  if (!conversation) {
    return (
      <PuiStack height="100%" justifyContent="center" alignItems="center" gap="10px">
        <PuiTypography variant="body-m-medium" color="grey.400">
          Select a conversation
        </PuiTypography>
        <PuiTypography variant="body-sm-regular" color="grey.300">
          Choose a contact from the list to start chatting.
        </PuiTypography>
      </PuiStack>
    );
  }

  const conversationInitials = conversation.displayTitle
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ChatAreaWrapper>
      <PuiStack>
        <StyledTopBar>
          <ConversationInfoWrapper>
            <div
              className="chat-panel__avatar"
              style={{
                background: conversation.displayAvatarUrl
                  ? undefined
                  : conversation.displayAvatarColor ?? '#A8D0FF',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '13px',
                color: '#1f2131',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {conversation.displayAvatarUrl ? (
                <img
                  src={conversation.displayAvatarUrl}
                  alt={conversation.displayTitle}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                conversationInitials
              )}
            </div>
            <PuiStack sx={{ minWidth: 0, overflow: 'hidden' }}>
              <PuiTypography variant="body-m-semibold" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conversation.displayTitle}
              </PuiTypography>
              <PuiTypography variant="body-sm-regular" color="grey.400" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conversation.displaySubtitle}
              </PuiTypography>
            </PuiStack>
          </ConversationInfoWrapper>
          <PuiStack direction="row" gap="16px">
            <StyledTopBarButton aria-label="Add participant" title="Add participant">
              <PuiSvgIcon width={20} height={20} icon={PuiIcon.UserPlus1} />
            </StyledTopBarButton>
            <StyledTopBarButton className="contained" aria-label="Start a call" title="Start a call">
              <PuiSvgIcon width={16} height={16} icon={PuiIcon.Phone} />
            </StyledTopBarButton>
          </PuiStack>
        </StyledTopBar>
        <PuiDivider />
      </PuiStack>

      <MessagesContainer>
        <MessageList messages={messages} currentUserId={user.uid} />
      </MessagesContainer>

      <ConversationInput
        conversationTitle={conversation.displayTitle}
        composerValue={composerValue}
        setComposerValue={setComposerValue}
        pendingFile={pendingFile}
        setPendingFile={setPendingFile}
        onSubmit={handleSubmit}
        isSending={isSending}
        onSendMessage={onSendMessage}
      />
    </ChatAreaWrapper>
  );
}
