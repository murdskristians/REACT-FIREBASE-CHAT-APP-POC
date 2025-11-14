import { PuiBox, PuiStack } from 'piche.ui';
import { FC } from 'react';

import type { ViewConversation } from '../Workspace';
import { getInitials } from '../shared/avatarUtils';
import {
  ConversationInfoWrapper,
  StyledConversationTitle,
  StyledConversationSubtitle,
} from './StyledComponents';

interface ConversationInfoProps {
  conversation: ViewConversation;
  onContactClick?: () => void;
}

export const ConversationInfo: FC<ConversationInfoProps> = ({
  conversation,
  onContactClick,
}) => {
  console.log('[ConversationInfo] Top Bar Avatar', {
    conversationId: conversation.id,
    displayTitle: conversation.displayTitle,
    displayAvatarUrl: conversation.displayAvatarUrl ?? 'null/undefined',
    displayAvatarColor: conversation.displayAvatarColor,
    counterpartId: conversation.counterpartId,
  });

  const conversationInitials = getInitials(conversation.displayTitle);

  return (
    <ConversationInfoWrapper
      onClick={onContactClick}
      style={{ cursor: onContactClick ? 'pointer' : 'default' }}
    >
      <PuiBox
        className="chat-panel__avatar"
        sx={{
          background: conversation.displayAvatarUrl
            ? undefined
            : conversation.displayAvatarColor ?? '#A8D0FF',
        }}
      >
        {conversation.displayAvatarUrl ? (
          <img
            src={conversation.displayAvatarUrl}
            alt={conversation.displayTitle}
            referrerPolicy="no-referrer"
          />
        ) : (
          conversationInitials
        )}
      </PuiBox>
      <PuiStack gap="2px" sx={{ minWidth: 0 }}>
        <StyledConversationTitle variant="body-m-semibold">
          {conversation.displayTitle}
        </StyledConversationTitle>
        <StyledConversationSubtitle variant="body-sm-medium" color="grey.300">
          {conversation.displaySubtitle}
        </StyledConversationSubtitle>
      </PuiStack>
    </ConversationInfoWrapper>
  );
};
