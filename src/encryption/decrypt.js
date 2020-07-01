/* eslint-disable no-console */
import regeneratorRuntime from 'regenerator-runtime';
/*
    Derive a key from a password supplied by the user, and use the key
    to decrypt the ciphertext.
    If the ciphertext was decrypted successfully,
    update "decryptedValue" box with the decrypted value.
    If there was an error decrypting,
    update the "decryptedValue" box with an error message.
    */

async function decrypt(password, badPass, salt, iv, eTitle, eBody) {
  let body;
  let title;

  /*
    Get some key material to use as input to the deriveKey method.
    The key material is a password supplied by the user.
    */
  function getKeyMaterial() {
    console.log('decrypt line 20');
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
    console.log('decrypt line 36', salt, cryptoKey);
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
    Update the "ciphertextValue" box with a representation of part of
    the ciphertext.
    */
  const keyMaterial = await getKeyMaterial();
  const key = await getKey(keyMaterial);
  console.log('decrypt line 59', key);

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
    title = dec.decode(enTitle);
    // eslint-disable-next-line no-console
    console.log('decrypt line 70', enTitle);
    const enBody = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      eBody,
    );

    const dec2 = new TextDecoder();
    body = dec2.decode(enBody);
  } catch (e) {
    badPass((count) => count + 1);
    console.log('password not right', e.name, e.message, e.code);
  }
  // }());

  // let ready = false;
  // let eTitle;
  // let eBody;
  // const salt = String(crypto.getRandomValues(new Uint8Array(6)));
  // const iv = crypto.getRandomValues(new Uint8Array(12));

  // async function generateCiphers() {
  //   // eslint-disable-next-line new-cap
  //   const key = new keyGen(password, salt, 512, 32);
  //   key.deriveKey((/* %calculated status */) => {}, (k) => {
  //     console.log(k);
  //     // eTitle = encryptMessage(key, title, iv);
  //     (async () => { eTitle = await encryptMessage(k, title, iv); console.log(eTitle); })();

  //     //.then((blob) => { eTitle = blob; console.log(eTitle) })
  //       // .then(encryptMessage(k, body, iv)
  //       //   .then((blob) => { eBody = blob; }))
  //       // .then(console.log(eTitle, eBody))
  //       // .finally(ready = true);
  //   });
  console.log('here in decrypt', title, body);
  return ([
    title,
    body,
  ]);
}

export default decrypt;
