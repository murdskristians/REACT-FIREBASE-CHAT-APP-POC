import React, { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';

import Message from './Message';

import './Channel.css';

type ChannelProps = {
  user: firebase.User;
  db: firebase.firestore.Firestore;
};

type FirestoreMessage = {
  id: string;
  text: string;
  createdAt?: firebase.firestore.Timestamp | null;
  uid?: string;
  displayName?: string;
  photoURL?: string;
};

const Channel: React.FC<ChannelProps> = ({ user, db }) => {
  const [messages, setMessages] = useState<FirestoreMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const { uid, displayName, photoURL } = user;

  useEffect(() => {
    const unsubscribe = db
      .collection('messages')
      .orderBy('createdAt')
      .limit(100)
      .onSnapshot((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as firebase.firestore.DocumentData),
          id: doc.id,
        })) as FirestoreMessage[];

        setMessages(data);
      });

    return unsubscribe;
  }, [db]);

  const handleOnChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setNewMessage(event.target.value);
  };

  const handleOnSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    await db.collection('messages').add({
      text: newMessage,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      displayName,
      photoURL,
    });

    setNewMessage('');
  };

  return (
    <div className="channel-container">
      <div className="messages-container">
        <ul className="messages-list">
          {messages.map((message) => (
            <li key={message.id}>
              <Message {...message} />
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleOnSubmit} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={handleOnChange}
          placeholder="Type your message here ..."
          className="message-input"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="send-button"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Channel;

