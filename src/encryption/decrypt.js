import { getKeyMaterial, getKey, decodeMessage } from './crypt';
/*
    Derive a key from a password supplied by the user, and use the key
    to decrypt the ciphertext.
    If the ciphertext was decrypted successfully,
    pass the title and the body.
    If there was an error decrypting,
    pass badPass
    */

async function decrypt(pass, s, iv, eTitle, eBody) {
  let body;
  let title;
  let badPass = 0;

  /*
    Derive a key from a password supplied by the user, and use the key
    to encrypt the message.
    */
  const keyMaterial = await getKeyMaterial(pass);
  const key = await getKey(keyMaterial, s);

  try {
    const enTitle = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      eTitle,
    );
    title = decodeMessage(enTitle);
    const enBody = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      eBody,
    );

    body = decodeMessage(enBody);
  } catch {
    badPass = 1;
  }

  return ([
    title,
    body,
    badPass,
  ]);
}

export default decrypt;
