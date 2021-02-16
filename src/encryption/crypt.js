/*
Store the calculated ciphertext and IV here, so we can decrypt the message later.
*/
// let ciphertext;
// let iv; //should be stored in the db, not secret ,stands for Initialization Vector

/*
Fetch the contents of the "message" textbox, and encode it
in a form we can use for the encrypt operation.
*/
const encodeMessage = (text) => {
  const enc = new TextEncoder();
  return enc.encode(text);
};

const decodeMessage = (string) => {
  const dec = new TextDecoder();
  return dec.decode(string);
};

/*
  Get some key material to use as input to the deriveKey method.
  The key material is a password supplied by the user.
  */
function getKeyMaterial(password) {
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
  Given some key material and salt
  derive an AES-GCM key using PBKDF2.
  */
function getKey(cryptoKey, salt) {
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

export {
  getKeyMaterial, getKey, encodeMessage, decodeMessage,
};

/*
Generate an encryption key, then set up event listeners
on the "Encrypt" and "Decrypt" buttons.
*/
// window.crypto.subtle.generateKey(
//   {
//       name: "AES-GCM",
//       length: 256,
//   },
//   true,
//   ["encrypt", "decrypt"]
// ).then((key) => {
//   const encryptButton = document.querySelector(".aes-gcm .encrypt-button");
//   encryptButton.addEventListener("click", () => {
//     encryptMessage(key);
//   });

//   const decryptButton = document.querySelector(".aes-gcm .decrypt-button");
//   decryptButton.addEventListener("click", () => {
//     decryptMessage(key);
//   });
// });
