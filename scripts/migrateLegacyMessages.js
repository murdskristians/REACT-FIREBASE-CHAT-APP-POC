/* eslint-disable @typescript-eslint/no-var-requires */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? path.resolve(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('❌ Service account JSON not found. Provide FIREBASE_SERVICE_ACCOUNT_PATH or place serviceAccountKey.json next to this script.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)),
});

const db = admin.firestore();

const AVATAR_COLORS = ['#FFD37D', '#A8D0FF', '#FFC8DD', '#B5EAEA', '#BDB2FF', '#FFABAB', '#CAF0F8'];

const pickAvatarColor = (uid) => {
  const hash = uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

async function ensureConversationExists({ participants, title, subtitle = null, avatarColor = null, avatarUrl = null }) {
  const sortedParticipants = [...new Set(participants)].sort();
  const participantKey = sortedParticipants.join('_');

  const existing = await db
    .collection('conversations')
    .where('participantKey', '==', participantKey)
    .limit(1)
    .get();

  if (!existing.empty) {
    return existing.docs[0].id;
  }

  const conversationRef = await db.collection('conversations').add({
    title,
    subtitle,
    avatarColor: avatarColor ?? pickAvatarColor(participantKey),
    avatarUrl,
    participants: sortedParticipants,
    participantKey,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastMessage: null,
  });

  return conversationRef.id;
}

async function migrateLegacyMessages() {
  const legacyMessages = await db.collection('messages').orderBy('createdAt', 'asc').get();

  if (legacyMessages.empty) {
    console.log('ℹ️  No legacy messages found. Nothing to migrate.');
    return;
  }

  const participants = new Map();
  const messageDocs = [];

  legacyMessages.forEach((doc) => {
    const data = doc.data();
    if (!data || !data.uid) {
      return;
    }

    participants.set(data.uid, {
      displayName: data.displayName ?? data.name ?? 'Unknown user',
      email: data.email ?? null,
      avatarUrl: data.photoURL ?? null,
    });

    messageDocs.push({
      id: doc.id,
      uid: data.uid,
      displayName: data.displayName ?? data.name ?? 'Unknown user',
      photoURL: data.photoURL ?? null,
      text: data.text ?? null,
      createdAt: data.createdAt ?? admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  if (!participants.size) {
    console.log('ℹ️  Legacy messages do not contain any participants.');
    return;
  }

  // Upsert users
  await Promise.all(
    Array.from(participants.entries()).map(([uid, userData]) =>
      db
        .collection('users')
        .doc(uid)
        .set(
          {
            displayName: userData.displayName,
            email: userData.email,
            avatarUrl: userData.avatarUrl,
            avatarColor: '#A8D0FF',
            status: 'Online',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
    )
  );

  const participantIds = Array.from(participants.keys()).sort();

  for (let i = 0; i < participantIds.length; i++) {
    for (let j = i + 1; j < participantIds.length; j++) {
      const uidA = participantIds[i];
      const uidB = participantIds[j];

      const profileA = participants.get(uidA);
      const profileB = participants.get(uidB);

      const conversationId = await ensureConversationExists({
        participants: [uidA, uidB],
        title: `${profileA?.displayName ?? uidA} & ${profileB?.displayName ?? uidB}`,
        subtitle: 'Migrated from legacy chat',
        avatarColor: profileB?.avatarColor ?? profileA?.avatarColor ?? '#4A90E2',
        avatarUrl: profileB?.avatarUrl ?? null,
      });

      console.log(`✅ Conversation ensured for ${uidA} ↔ ${uidB}: ${conversationId}`);
    }
  }
}

migrateLegacyMessages()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

