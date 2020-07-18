import regeneratorRuntime from 'regenerator-runtime';
import React, { useState, useEffect } from 'react';
import 'core-js';
import { getKeyMaterial, getKey, encodeMessage } from './crypt';

async function encrypt(pass, body, title) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  let eBody;
  let eTitle;
  const iv = crypto.getRandomValues(new Uint8Array(12));

  /*
    Derive a key from a password supplied by the user, and use the key
    to encrypt the message.
    */
  await (async function hash() {
    const keyMaterial = await getKeyMaterial(pass);
    const key = await getKey(keyMaterial, salt);
    const encodedTitle = encodeMessage(title);
    const encodedBody = encodeMessage(body);

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

  return ({
    eTitle,
    eBody,
    iv,
    salt,
  });
}
export default encrypt;
