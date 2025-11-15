import {
  PuiAvatar,
  PuiBox,
  PuiButton,
  PuiIcon,
  PuiIconButton,
  PuiLoadingButton,
  PuiStack,
  PuiSvgIcon,
  PuiSwitch,
  PuiTextInput,
  PuiTypography,
  PuiStyled,
  useTheme,
} from 'piche.ui';
import { useState, type FC, useMemo } from 'react';
import { styled } from '@mui/material/styles';

import type { Contact } from '../../../firebase/users';
import type { Conversation, ConversationMessage } from '../../../firebase/conversations';
import { Reply } from './message-card/reply/Reply';
import type { MessageReply } from '../../../firebase/conversations';
import '../Workspace.css';

const StyledForwardPanelWrapper = PuiStyled(PuiBox)(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  background: '#ffffff',
  borderLeft: '1px solid #f0f0f0',
  position: 'relative',
  pointerEvents: 'auto',
  zIndex: 1001,
  '& *': {
    pointerEvents: 'auto',
  },
  '& input': {
    pointerEvents: 'auto !important',
  },
}));

const StyledHeaderDivider = PuiStyled(PuiBox)(() => ({
  height: '1px',
  backgroundColor: '#f0f0f0',
  margin: '0 32px',
}));

const StyledButtonWrapper = PuiStyled(PuiBox)(() => ({
  padding: '20px 32px',
  borderTop: '1px solid #f0f0f0',
  marginTop: 'auto',
}));

const SearchInputWrapper = styled(PuiBox)(({ theme }) => ({
  padding: '24px 32px 16px 32px',
  position: 'relative',
  zIndex: 10,
}));

const ConversationListContainer = styled(PuiBox)(({ theme }) => ({
  flexGrow: 1,
  paddingBottom: '8px',
  overflowY: 'auto',
  paddingLeft: '32px',
  paddingRight: '32px',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'transparent',
    borderRadius: '4px',
  },
  '&:hover::-webkit-scrollbar-thumb': {
    background: '#d0d0d0',
  },
}));

const ConversationListItem = styled(PuiBox)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 24px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}));

const ConversationInfo = styled(PuiBox)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1,
  minWidth: 0,
}));

const EmptyState = styled(PuiBox)(({ theme }) => ({
  padding: '32px',
  textAlign: 'center',
  color: theme.palette.grey[600],
}));

const MessagePreviewWrapper = styled(PuiBox)(({ theme }) => ({
  padding: '12px',
  backgroundColor: theme.palette.background.default,
  borderRadius: '8px',
  marginBottom: '12px',
}));

const ForwardInputWrapper = styled(PuiBox)(({ theme }) => ({
  padding: '0 32px 16px 32px',
  position: 'relative',
  zIndex: 10,
}));

interface ForwardMessageModalProps {
  open: boolean;
  onClose: () => void;
  message: ConversationMessage;
  conversations: Conversation[];
  contacts: Contact[];
  currentUserId: string;
  onForward: (targetConversationIds: string[], forwardText?: string) => Promise<void>;
  isLoading?: boolean;
}

export const ForwardMessageModal: FC<ForwardMessageModalProps> = ({
  open,
  onClose,
  message,
  conversations,
  contacts,
  currentUserId,
  onForward,
  isLoading = false,
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);
  const [forwardText, setForwardText] = useState('');

  // Filter conversations and contacts based on search
  const filteredData = useMemo(() => {
    if (!message) {
      return { filteredConversations: [], filteredContacts: [] };
    }
    const query = searchQuery.toLowerCase().trim();

    // Filter out any null/undefined conversations
    const validConversations = (conversations || []).filter((conv) => conv != null);
    const filteredConversations = validConversations.filter((conv) => {
      if (!query) return true;
      const title = (conv.title || '').toLowerCase();
      return title.includes(query);
    });

    // Filter out any null/undefined contacts
    const validContacts = (contacts || []).filter((contact) => contact != null && contact.id);
    const filteredContacts = validContacts.filter((contact) => {
      if (contact.id === currentUserId) return false;
      if (!query) return true;
      const displayName = (contact.displayName || '').toLowerCase();
      const email = (contact.email || '').toLowerCase();
      return displayName.includes(query) || email.includes(query);
    });

    return { filteredConversations, filteredContacts };
  }, [searchQuery, conversations, contacts, currentUserId, message]);

  const handleToggleConversation = (conversationId: string) => {
    setSelectedConversationIds((prev) => {
      if (prev.includes(conversationId)) {
        return prev.filter((id) => id !== conversationId);
      }
      return [...prev, conversationId];
    });
  };

  const handleToggleContact = (contactId: string) => {
    setSelectedConversationIds((prev) => {
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId);
      }
      return [...prev, contactId];
    });
  };

  const handleForward = async () => {
    if (selectedConversationIds.length === 0) return;
    await onForward(selectedConversationIds, forwardText.trim() || undefined);
    setSelectedConversationIds([]);
    setForwardText('');
    setSearchQuery('');
  };

  const handleClose = () => {
    setSelectedConversationIds([]);
    setForwardText('');
    setSearchQuery('');
    onClose();
  };

  // Create reply data for preview
  const replyData: MessageReply | null = useMemo(() => {
    if (!message) return null;
    return {
      messageId: message.id,
      senderId: message.senderId,
      senderName: message.senderName ?? null,
      text: message.text ?? null,
      imageUrl: message.imageUrl ?? null,
      type: message.type,
      createdAt: message.createdAt ?? null,
    };
  }, [message]);

  // Sort conversations: selected first, then by type (direct before group), then alphabetically
  const sortedConversations = [...filteredData.filteredConversations].sort((a, b) => {
    const aSelected = selectedConversationIds.includes(a.id) ? -1 : 1;
    const bSelected = selectedConversationIds.includes(b.id) ? -1 : 1;
    if (aSelected !== bSelected) return aSelected - bSelected;

    const aDirect = a.type === 'direct' ? -1 : 1;
    const bDirect = b.type === 'direct' ? -1 : 1;
    if (aDirect !== bDirect) return aDirect - bDirect;

    return (a.title || '').localeCompare(b.title || '');
  });

  // Filter out contacts that already have conversations
  const existingContactIds = new Set(
    (conversations || [])
      .filter((conv) => conv != null && conv.participants)
      .flatMap((conv) => (conv.participants || []).filter((id) => id && id !== currentUserId))
  );
  const newContacts = filteredData.filteredContacts.filter((contact) => contact && contact.id && !existingContactIds.has(contact.id));

  // Guard against missing message or closed panel
  if (!message || !open) {
    return null;
  }

  return (
    <StyledForwardPanelWrapper
      aria-label="Forward message panel"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <PuiBox
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '32px 32px 24px 32px',
        }}
      >
        <PuiTypography
          variant="h5"
          sx={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 600,
            color: '#272727',
            fontFamily: "'Poppins', 'Inter', sans-serif",
          }}
        >
          Forward Message
        </PuiTypography>
        <PuiIconButton onClick={handleClose} aria-label="Close" size="small">
          <PuiSvgIcon width={20} height={20} icon={PuiIcon.XClose} />
        </PuiIconButton>
      </PuiBox>

      <StyledHeaderDivider />

      <PuiBox
        sx={{
          padding: '0 0 16px 0',
        }}
      >
        <PuiTypography
          variant="body-m-regular"
          sx={{
            padding: '0 32px 16px 32px',
            color: '#939393',
            fontSize: '13px',
            fontFamily: "'Poppins', 'Inter', sans-serif",
          }}
        >
          Select conversations or contacts to forward this message
        </PuiTypography>
      </PuiBox>
      <SearchInputWrapper>
        <input
          type="search"
          placeholder="Search conversations or contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={(e) => {
            e.stopPropagation();
            e.currentTarget.focus();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          disabled={false}
          readOnly={false}
          tabIndex={0}
          autoFocus={false}
          style={{
            width: '100%',
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: "'Poppins', 'Inter', sans-serif",
            color: '#272727',
            outline: 'none',
            background: '#ffffff',
            boxSizing: 'border-box',
            cursor: 'text',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 1000,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3398DB';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#f0f0f0';
          }}
        />
      </SearchInputWrapper>

      <ConversationListContainer>
        {sortedConversations.length === 0 && newContacts.length === 0 ? (
          <EmptyState>
            <PuiTypography variant="body-m-regular">
              {searchQuery ? 'No results found' : 'No conversations or contacts available'}
            </PuiTypography>
          </EmptyState>
        ) : (
          <>
            {sortedConversations
              .filter((conv) => conv != null && conv.id)
              .map((conversation) => {
                const otherParticipants = (conversation.participants || []).filter((id) => id && id !== currentUserId);
                const isSelected = selectedConversationIds.includes(conversation.id);

                // Get display info
                let displayName = conversation.title || 'Untitled';
                let avatarUrl: string | null = null;
                let avatarColor = conversation.avatarColor || '#A8D0FF';

                if (conversation.type === 'direct' && otherParticipants.length > 0) {
                  const contactId = otherParticipants[0];
                  const contact = contacts.find((c) => c && c.id === contactId);
                  if (contact && contact.id) {
                    displayName = contact.displayName || contact.email || 'Unknown';
                    avatarUrl = contact.avatarUrl ?? null;
                    avatarColor = contact.avatarColor ?? avatarColor;
                  }
                } else if (conversation.type === 'group') {
                  avatarUrl = conversation.avatarUrl ?? null;
                }

              return (
                <ConversationListItem
                  key={conversation.id}
                  onClick={() => handleToggleConversation(conversation.id)}
                >
                  <ConversationInfo>
                    <PuiAvatar
                      contact={{
                        id: conversation.id,
                        name: displayName,
                        email: '',
                        avatarUrl: avatarUrl || undefined,
                      }}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: avatarColor,
                      }}
                    />
                    <PuiStack spacing="2px" sx={{ flex: 1, minWidth: 0 }}>
                      <PuiTypography variant="body-m-semibold" noWrap>
                        {displayName}
                      </PuiTypography>
                      {conversation.type === 'group' && (
                        <PuiTypography variant="body-s-regular" color="textSecondary">
                          {conversation.participants.length} members
                        </PuiTypography>
                      )}
                    </PuiStack>
                  </ConversationInfo>
                  <PuiSwitch checked={isSelected} />
                </ConversationListItem>
              );
            })}

            {newContacts
              .filter((contact) => contact != null && contact.id)
              .map((contact) => {
                if (!contact || !contact.id) return null;
                const isSelected = selectedConversationIds.includes(contact.id);
                const avatarUrl = contact.avatarUrl ?? null;
                const avatarColor = contact.avatarColor ?? '#A8D0FF';
                const displayName = contact.displayName || 'Unknown User';
                const email = contact.email || '';
                
                return (
                  <ConversationListItem
                    key={contact.id}
                    onClick={() => handleToggleContact(contact.id)}
                  >
                    <ConversationInfo>
                      <PuiAvatar
                        contact={{
                          id: contact.id,
                          name: displayName,
                          email: email || undefined,
                          avatarUrl: avatarUrl || undefined,
                        }}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: avatarColor,
                        }}
                      />
                    <PuiStack spacing="2px" sx={{ flex: 1, minWidth: 0 }}>
                      <PuiTypography variant="body-m-semibold" noWrap>
                        {displayName}
                      </PuiTypography>
                      {email && (
                        <PuiTypography variant="body-s-regular" color="textSecondary">
                          {email}
                        </PuiTypography>
                      )}
                    </PuiStack>
                  </ConversationInfo>
                  <PuiSwitch checked={isSelected} />
                </ConversationListItem>
              );
              })
              .filter((item) => item != null)}
          </>
        )}
      </ConversationListContainer>

      {replyData && (
        <MessagePreviewWrapper>
          <PuiTypography variant="body-sm-medium" sx={{ marginBottom: '8px' }}>
            Message Preview:
          </PuiTypography>
          <Reply replyTo={replyData} />
        </MessagePreviewWrapper>
      )}

      <ForwardInputWrapper>
        <textarea
          placeholder="Add a comment (optional)..."
          value={forwardText}
          onChange={(e) => setForwardText(e.target.value)}
          onClick={(e) => {
            e.stopPropagation();
            e.currentTarget.focus();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          disabled={false}
          readOnly={false}
          tabIndex={0}
          style={{
            width: '100%',
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: "'Poppins', 'Inter', sans-serif",
            color: '#272727',
            outline: 'none',
            background: '#ffffff',
            boxSizing: 'border-box',
            cursor: 'text',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 1000,
            resize: 'vertical',
            minHeight: '60px',
            maxHeight: '120px',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3398DB';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#f0f0f0';
          }}
        />
      </ForwardInputWrapper>

      <StyledButtonWrapper>
        <PuiLoadingButton
          variant="contained"
          size="medium"
          loading={isLoading}
          disabled={selectedConversationIds.length === 0}
          fullWidth
          onClick={handleForward}
          sx={{
            backgroundColor:
              selectedConversationIds.length === 0 ? '#d0d0d0' : '#3398DB',
            color: '#ffffff',
            '&:hover:not(.Mui-disabled)': {
              backgroundColor: '#2980b9',
            },
            '&.Mui-disabled': {
              backgroundColor: '#d0d0d0 !important',
              color: '#ffffff',
            },
          }}
        >
          Forward ({selectedConversationIds.length})
        </PuiLoadingButton>
      </StyledButtonWrapper>
    </StyledForwardPanelWrapper>
  );
};

