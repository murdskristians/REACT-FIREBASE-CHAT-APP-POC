# Firebase Setup Guide

Этот проект ожидает, что в Firestore и Storage будет настроена структура с контактами (`users`) и диалогами (`conversations`). Ниже пошагово описано, что нужно сделать.

## 1. Правила безопасности

### Firestore
Файл `firebase/firestore.rules` уже добавлен в проект. Разверните эти правила командой:

```bash
firebase deploy --only firestore:rules
```

Правила разрешают:

- читать/обновлять профиль только самому пользователю (`users/{uid}`);
- видеть и писать в диалог только участникам (`conversations/{id}`);
- создавать сообщения только участникам диалога; редактирование/удаление сообщений запрещено.

### Storage
Файл `firebase/storage.rules` ограничивает загрузку/чтение вложений участниками соответствующего диалога. Развернуть:

```bash
firebase deploy --only storage
```

## 2. Структура коллекций

### `users/{uid}`
```jsonc
{
  "displayName": "Kristiāns Murds",
  "email": "kristians@example.com",
  "avatarUrl": null,
  "avatarColor": "#FFD37D",
  "status": "Last seen recently",
  "createdAt": serverTimestamp(),
  "updatedAt": serverTimestamp()
}
```

### `conversations/{conversationId}`
```jsonc
{
  "title": "Kristiāns Murds",
  "subtitle": "Last seen recently",
  "avatarUrl": null,
  "avatarColor": "#FFD37D",
  "participants": ["uidA", "uidB"],
  "participantKey": "uidA_uidB",             // отсортированные участники через подчёркивание
  "createdAt": serverTimestamp(),
  "updatedAt": serverTimestamp(),
  "lastMessage": {
    "senderId": "uidA",
    "senderName": "Jane Doe",
    "text": "Привет!",
    "imageUrl": null,
    "type": "text",
    "createdAt": serverTimestamp()
  }
}
```

#### Подколлекция `messages`
```
conversations/{conversationId}/messages/{messageId} = {
  senderId: "uidA",
  senderName: "Jane Doe",
  text: "Привет!",
  imageUrl: null,
  type: "text",                  // 'text' или 'image'
  createdAt: serverTimestamp()
}
```

### Storage
Файлы сохраняются по пути `conversations/{conversationId}/{messageId}-{originalFilename}`.

## 3. Быстрый сидер данных

В каталоге `scripts` есть `seedFirestore.js`. Он создаёт двух демо-пользователей и один диалог между ними.

### Подготовка
1. Скачайте JSON с сервисным аккаунтом Firebase и положите в `scripts/serviceAccountKey.json`, либо установите путь в переменной `FIREBASE_SERVICE_ACCOUNT_PATH`.
2. Установите `firebase-admin`:
   ```bash
   pnpm add -D firebase-admin
   ```

### Запуск
```bash
node scripts/seedFirestore.js
```

После выполнения в Firestore появятся документы:
- `users/demo-user-1`, `users/demo-user-2`;
- `conversations/{новый id}` + одно сообщение.

## 4. Миграция старой коллекции `messages`

Если ранее сообщения хранились в единой коллекции `messages` (например, поля `uid`, `displayName`, `photoURL`, `text`), запустите:

```bash
pnpm firebase:migrate-legacy
```

Скрипт:
- создаст документы в `users` для всех встреченных `uid`;
- сформирует новую запись `conversations/legacy-{timestamp}` и перенесёт туда все сообщения;
- заполнит поле `lastMessage` для корректного отображения превью.

После миграции старую коллекцию `messages` можно оставить для истории или удалить вручную.

## 5. Проверка

1. Очистите кэш зависимостей (если локфайл был повреждён):
   ```bash
   Remove-Item pnpm-lock.yaml
   Remove-Item -Recurse -Force node_modules
   pnpm install
   ```
2. Запустите приложение `pnpm start` (или `pnpm run build`).
3. Залогиньтесь, убедитесь, что:
   - слева отображаются диалоги и список пользователей;
   - можно выбрать контакт и начать новый диалог;
   - текст и изображения отправляются, файлы попадают в Storage.

На этом всё — после выполнения шагов Firebase готов к работе с новым UI.

