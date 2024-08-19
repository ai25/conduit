function toBase64(arrayBuffer: ArrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  const binaryString = String.fromCharCode(...uint8Array);
  return btoa(binaryString);
}

function fromBase64(base64: string) {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function generateSymmetricKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

async function exportSymmetricKey(key: CryptoKey) {
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  return toBase64(exportedKey);
}

function uint8ArrayToHex(uint8Array: Uint8Array) {
  return Array.from(uint8Array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function encryptData(data: string, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(data)
  );

  const encryptedHex = uint8ArrayToHex(new Uint8Array(encrypted));
  const ivHex = uint8ArrayToHex(iv);

  return `${ivHex}:${encryptedHex}`;
}

async function importSymmetricKey(rawKeyBase64: string) {
  const rawKey = fromBase64(rawKeyBase64);
  return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, true, [
    "encrypt",
    "decrypt",
  ]);
}

async function decryptData(encryptedData: string, key: CryptoKey) {
  const [ivHex, encryptedHex] = encryptedData.split(":");
  const iv = new Uint8Array(
    ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  const encrypted = new Uint8Array(
    encryptedHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

function isLinkExpired(timestamp: string, expiryTime = 100 * 60 * 1000) {
  const currentTime = Date.now();
  const linkTime = parseInt(timestamp, 10);
  return currentTime - linkTime > expiryTime;
}

async function generateHMAC(key: CryptoKey, data: string) {
  const encoder = new TextEncoder();
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    await crypto.subtle.exportKey("raw", key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    encoder.encode(data)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createShareableLink(data: string) {
  // use a symmetric key to encrypt the data, add a timestamp that will be used to check expiry, and sign the data to ensure timestamp cannot be modified.
  const key = await generateSymmetricKey();
  const encryptedData = await encryptData(data, key);
  const exportedKey = await exportSymmetricKey(key);
  const timestamp = Date.now();

  const dataToSign = `${encryptedData}||${exportedKey}||${timestamp}`;
  const signature = await generateHMAC(key, dataToSign);

  const combinedData = `${encryptedData}||${exportedKey}||${timestamp}||${signature}`;
  const encodedData = toBase64(new TextEncoder().encode(combinedData));

  return `${window.location.origin}/pair?data=${encodeURIComponent(encodedData)}`;
}

export async function handleIncomingLink(data: string) {
  if (!data) throw new Error("Invalid link");

  const combinedData = new TextDecoder().decode(
    fromBase64(decodeURIComponent(data))
  );
  const [encryptedData, keyHex, timestamp, signature] =
    combinedData.split("||");

  if (!encryptedData || !keyHex || !timestamp || !signature) {
    throw new Error("Invalid data format");
  }
  console.log(combinedData, signature, "data");

  if (isLinkExpired(timestamp)) {
    throw new Error("Link has expired");
  }

  const key = await importSymmetricKey(keyHex);
  const dataToVerify = `${encryptedData}||${keyHex}||${timestamp}`;
  const calculatedSignature = await generateHMAC(key, dataToVerify);

  if (calculatedSignature !== signature) {
    throw new Error("Invalid signature");
  }

  const decryptedData = await decryptData(encryptedData, key);
  return decryptedData;
}
