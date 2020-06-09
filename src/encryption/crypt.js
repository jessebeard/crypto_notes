import regeneratorRuntime from 'regenerator-runtime';
  /*
  Store the calculated ciphertext and IV here, so we can decrypt the message later.
  */
// let ciphertext;
// let iv; //should be stored in the db, not secret ,stands for Initialization Vector

/*
Fetch the contents of the "message" textbox, and encode it
in a form we can use for the encrypt operation.
*/
function getMessageEncoding(text) {
  const enc = new TextEncoder();
  return enc.encode(text);
}

/*
Get the encoded m essage, encrypt it and display a representation
of the ciphertext in the "Ciphertext" element.
*/
async function encryptMessage(key, text, iv) {
  const encoded = getMessageEncoding(text);
  // The iv must never be reused with a given key.
  // const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded,
  );
  return ciphertext;
}

/*
Fetch the ciphertext and decrypt it.
Write the decrypted message into the "Decrypted" box.
*/
async function decryptMessage(key, iv, ciphertext, cb) {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    ciphertext,
  );

  const dec = new TextDecoder();
  cb(dec.decode(decrypted));
}

export { encryptMessage, decryptMessage };

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
