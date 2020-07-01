/* eslint-disable no-console */
/* eslint-disable comma-dangle */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
// import regeneratorRuntime from 'regenerator-runtime';
import useInput from './utilities/useInput';
import encrypt from './encryption/encrypt';
import decrypt from './encryption/decrypt';
/* **************************************************** *
 *                HELPER FUNCTIONS                      *
 * **************************************************** */
function arrayBufferToString(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}
function stringToArrayBuffer(str) {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i += 1) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}


const App = () => {
  const [library, setLibrary] = useInput('');
  const [password, setPassword] = useInput('');
  const [title, setTitle] = useInput('');
  const [body, setBody] = useInput('');
  // const [messages, setMessages] = useState();
  const [submit, setSubmit] = useState(false);
  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmit(true);
  };
  useEffect(() => {
    if (password === '') return;
    (async () => {
      const {
        eTitle, eBody, iv, salt,
      } = await encrypt(password, body, title);
      // eslint-disable-next-line no-console
      console.log(eTitle, eBody, iv, salt);
      const myHeaders = new Headers([
        ['Content-Type', 'application/json'],
      ]);

      const myInit = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({
          library,
          iv: Array.from(iv.values()),
          salt: Array.from(salt.values()),
          title: arrayBufferToString(eTitle),
          body: arrayBufferToString(eBody)
        }),
      };
      // eslint-disable-next-line no-console
      console.log(myInit);
      const request = new Request('http://localhost:1337/submit/', myInit);
      fetch(request)
        .then((response) => {
          if (response.status === 201) {
            return response.json();
          }
          throw new Error('Something went wrong on api server!');
        })
        .then((response) => {
          // eslint-disable-next-line no-console
          console.debug(response);
          // ...
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submit]);

  const [failedDecrypts, setFailedDecrypts] = useState(0);
  const [getEntries, setGetEntries] = useState(false);
  const [numEntries, setNumEntries] = useState();
  const handleGet = (event) => {
    event.preventDefault();
    setGetEntries(true);
  };
  useEffect(() => {
    if (password === '') return;
    //
    const request = new Request(`http://localhost:1337/query/${library}`);

    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        throw new Error('Something went wrong on api server!');
      })
      // eslint-disable-next-line no-console
      .then((response) => {
        setNumEntries(response.length);
        console.log(response.length, numEntries);
        for (let i = 0; i < response.length; i += 1) {
          const entry = response[i];
          console.log(entry);
          (async () => {
            const [t, b] = await decrypt(password,
              setFailedDecrypts,
              new Uint8Array(entry.salt),
              new Uint8Array(entry.iv),
              stringToArrayBuffer(entry.body),
              stringToArrayBuffer(entry.title));
            console.log(t, b, entry.iv, entry.salt, failedDecrypts);

          // ...
          })();
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getEntries]);


  // const { eTitle, eBody, iv, salt } = useEncrypt(password, body, title);
  // console.log(eTitle, eBody, iv, salt);

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <label>
        Library?
        <input
          required
          type="text"
          placeholder="e.g. Diary"
          value={library}
          onChange={setLibrary}
        />
      </label>
      <div className="divider" />
      <label>
        Password:
        <input
          required
          type="text"
          placeholder="don't forget this!"
          value={password}
          onChange={setPassword}
        />
      </label>
      <div className="divider" />
      <label>
        Title:
        <input
          required
          name="title"
          type="text"
          placeholder="entries are displayed chronologically"
          value={title}
          onChange={setTitle}
        />
      </label>
      <div className="divider" />
      <label>
        Body
        <textarea
          required
          type="text"
          value={body}
          onChange={setBody}
        />
      </label>
      <div className="divider" />
      <div className="divider" />
      <button
        type="submit"
      >
        Submit
      </button>
      <button
        type="button"
        onClick={(e) => handleGet(e)}
      >
        Get Notes and Decrypt
      </button>
    </form>
  );
};


export default App;
