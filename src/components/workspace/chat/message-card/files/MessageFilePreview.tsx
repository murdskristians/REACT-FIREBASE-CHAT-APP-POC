import { PuiBox, PuiIcon, PuiSvgIcon, PuiStack, PuiTypography, useTheme } from 'piche.ui';
import { FC, useMemo } from 'react';

interface MessageFilePreviewProps {
  fileUrl: string;
  fileName: string;
  onClick?: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getFileTypeFromName = (fileName: string): 'image' | 'pdf' | 'doc' | 'video' | 'general' => {
  const lowerName = fileName.toLowerCase();
  if (lowerName.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/)) return 'image';
  if (lowerName.match(/\.(pdf)$/)) return 'pdf';
  if (lowerName.match(/\.(doc|docx)$/)) return 'doc';
  if (lowerName.match(/\.(mp4|webm|ogg|mov)$/)) return 'video';
  return 'general';
};

export const MessageFilePreview: FC<MessageFilePreviewProps> = ({ fileUrl, fileName, onClick }) => {
  const theme = useTheme();
  const fileType = useMemo(() => getFileTypeFromName(fileName), [fileName]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <PuiBox
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        padding: '8px',
        borderRadius: '8px',
        background: theme.palette.grey[50],
        width: '219px',
        marginBottom: '8px',
        '&:hover': {
          background: theme.palette.grey[100],
        },
      }}
    >
      <PuiBox
        sx={{
          width: '46px',
          height: '46px',
          minWidth: '46px',
          minHeight: '46px',
          borderRadius: '4px',
          background: theme.palette.grey[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <PuiSvgIcon
          icon={PuiIcon.Attachment}
          width={24}
          height={24}
          stroke={theme.palette.grey[400]}
        />
      </PuiBox>
      <PuiStack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
        <PuiTypography
          variant="body-m-medium"
          sx={{
            fontSize: '13px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '165px',
          }}
        >
          {fileName}
        </PuiTypography>
        <PuiTypography variant="body-sm-regular" sx={{ fontSize: '12px', color: theme.palette.grey[600] }}>
          File
        </PuiTypography>
      </PuiStack>
    </PuiBox>
  );
};

