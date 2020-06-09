import regeneratorRuntime from 'regenerator-runtime';
import React, { useState, useEffect } from 'react';
import 'core-js';
import keyGen from './keyGen';

async function encrypt(password, body, title) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  let eBody;
  let eTitle;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  let titleReady = false;
  let bodyReady = false;

  /*
    Fetch the contents of the "message" textbox, and encode it
    in a form we can use for the encrypt operation.
    */
  function getMessageEncoding(text) {
    const enc = new TextEncoder();
    return enc.encode(text);
  }

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
  function getKey(keyMaterial) {
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
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
  await (async function hash() {
    const keyMaterial = await getKeyMaterial();
    const key = await getKey(keyMaterial, salt);
    const encodedTitle = getMessageEncoding(title);
    const encodedBody = getMessageEncoding(body);

    eBody = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encodedBody,
    );
    eTitle = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encodedTitle,
    );
    return [eTitle, eBody];
  }());
  bodyReady = true;
  titleReady = true;
  console.log('here');

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
  console.log(eTitle, eBody, iv, salt);
  return ({
    eTitle,
    eBody,
    iv,
    salt,
  });
}
export default encrypt;
