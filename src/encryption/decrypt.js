/* eslint-disable no-console */
import regeneratorRuntime from 'regenerator-runtime';
/*
    Derive a key from a password supplied by the user, and use the key
    to decrypt the ciphertext.
    If the ciphertext was decrypted successfully,
    pass the title and the body.
    If there was an error decrypting,
    pass badPass
    */

async function decrypt(password, salt, iv, eTitle, eBody) {
  let body;
  let title;
  let badPass = 0;

  /*
    Get some key material to use as input to the deriveKey method.
    The key material is a password supplied by the user.
    */
  function getKeyMaterial() {
    const enc = new TextEncoder();
    return window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey'],
    );
  }

  /*
    Given some key material and some random salt
    derive an AES-GCM key using PBKDF2.
    */
  function getKey(cryptoKey) {
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      cryptoKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );
  }

  /*
    Derive a key from a password supplied by the user, and use the key
    to encrypt the message.
    */
  const keyMaterial = await getKeyMaterial();
  const key = await getKey(keyMaterial);

  try {
    const enTitle = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      eTitle,
    );
    const dec = new TextDecoder();
    title = await dec.decode(enTitle);
    const enBody = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      eBody,
    );

    const dec2 = new TextDecoder();
    body = await dec2.decode(enBody);
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
