import { formatRelative } from 'date-fns';
import type { ConversationMessage } from '../../../firebase/conversations';

type MessageBubbleProps = {
  message: ConversationMessage;
  isOwn: boolean;
};

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const timestamp = message.createdAt?.toDate?.();
  const formattedTime = timestamp ? formatRelative(timestamp, new Date()) : '';

  return (
    <li className={`chat-messages__item ${isOwn ? 'chat-messages__item--own' : 'chat-messages__item--peer'}`}>
      {!isOwn && (
        <div className="chat-messages__avatar" aria-hidden="true">
          {(message.senderName ?? 'User')
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
      )}
      <div className="chat-messages__bubble">
        <header className="chat-messages__bubble-header">
          <span className="chat-messages__author">{isOwn ? 'You' : message.senderName ?? 'Participant'}</span>
          {formattedTime ? <time>{formattedTime}</time> : null}
        </header>
        {message.text ? <p className="chat-messages__text">{message.text}</p> : null}
        {message.imageUrl ? (
          <div className="chat-messages__image">
            <img src={message.imageUrl} alt="Sent attachment" />
          </div>
        ) : null}
      </div>
    </li>
  );
}

