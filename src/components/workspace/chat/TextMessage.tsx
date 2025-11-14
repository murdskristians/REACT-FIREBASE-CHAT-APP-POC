import { FC } from 'react';

import type { ConversationMessage } from '../../../firebase/conversations';
import { StyledMessageTextWrapper, StyledTextContent, StyledMessageStatus } from './MessageStyledComponents';

interface TextMessageProps {
  message: ConversationMessage;
  time: string;
  isUserMessage?: boolean;
}

export const TextMessage: FC<TextMessageProps> = ({ message, time, isUserMessage = false }) => {
  return (
    <StyledMessageTextWrapper>
      <StyledTextContent 
        variant="body-sm-regular"
        sx={{
          color: isUserMessage ? '#1f2131' : 'inherit',
        }}
      >
        {message.text}
      </StyledTextContent>
      <StyledMessageStatus 
        component="span"
        sx={{
          color: isUserMessage ? '#939393' : '#939393',
        }}
      >
        {time}
      </StyledMessageStatus>
    </StyledMessageTextWrapper>
  );
};
