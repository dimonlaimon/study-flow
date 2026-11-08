// Шифрование заметок на устройстве (AES-GCM, Web Crypto API).
// Ключ вычисляется из id пользователя — вводить пароль не нужно.
// ВАЖНО: это защита «от чужих глаз» в базе. Пока в приложении нет
// собственной авторизации, ключ восстановим из vk_id/telegram_id,
// так что это шифрование, а не идеальная секретность.

const SALT = 'studyflow-notes-v1';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function getKey(userId) {
  const material = encoder.encode(`${SALT}::${userId}`);
  const hash = await crypto.subtle.digest('SHA-256', material);
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Формат: base64( IV (12 байт) + шифротекст )
export async function encryptText(userId, text) {
  if (typeof text !== 'string') text = '';
  const key = await getKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(text))
  );
  const packed = new Uint8Array(iv.length + cipher.length);
  packed.set(iv, 0);
  packed.set(cipher, iv.length);
  return bytesToBase64(packed);
}

export async function decryptText(userId, packedBase64) {
  if (!packedBase64) return '';
  const key = await getKey(userId);
  const packed = base64ToBytes(packedBase64);
  const iv = packed.slice(0, 12);
  const cipher = packed.slice(12);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return decoder.decode(plain);
}
