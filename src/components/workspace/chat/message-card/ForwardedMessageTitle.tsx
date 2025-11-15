import { PuiAvatar, PuiBox, PuiTypography, useTheme } from 'piche.ui';
import type { FC } from 'react';

interface ForwardedMessageTitleProps {
  forwardedFromName: string;
  authorContactId?: string;
  authorAvatarUrl?: string | null;
  authorAvatarColor?: string | null;
}

export const ForwardedMessageTitle: FC<ForwardedMessageTitleProps> = ({
  forwardedFromName,
  authorContactId,
  authorAvatarUrl,
  authorAvatarColor,
}) => {
  const theme = useTheme();

  return (
    <PuiBox sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '4px' }}>
      <PuiTypography
        variant="body-sm-medium"
        color={theme.palette.primary.main}
        sx={{ paddingRight: '4px', flexShrink: 0 }}
      >
        Forwarded from
      </PuiTypography>
      {authorContactId && (
        <PuiAvatar
          contact={{
            id: authorContactId,
            name: forwardedFromName,
            email: '',
            avatarUrl: authorAvatarUrl || undefined,
          }}
          sx={{
            width: 16,
            height: 16,
            fontSize: '8px',
            bgcolor: authorAvatarColor || theme.palette.primary.main,
            marginRight: '4px',
          }}
        />
      )}
      <PuiTypography
        variant="body-sm-medium"
        color={theme.palette.grey[500]}
        noWrap
        sx={{
          cursor: authorContactId ? 'pointer' : 'default',
          '&:hover': {
            color: authorContactId ? theme.palette.primary.main : theme.palette.grey[500],
          },
        }}
      >
        {forwardedFromName}
      </PuiTypography>
    </PuiBox>
  );
};

