/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */
/* eslint-disable comma-dangle */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import regeneratorRuntime from 'regenerator-runtime';
import useInput from './utilities/useInput';
import encrypt from './encryption/encrypt';
import decrypt from './encryption/decrypt';
/* **************************************************** *
 *                HELPER FUNCTIONS                      *
 * JS crypto.subtle stores things in array buffers,     *
 * this converts them to and from strings for storage,  *
 * and subsquent decryption                             *
 * **************************************************** */
function arrayBufferToString(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}
function stringToArrayBuffer(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i += 1) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}


/* **************************************************** *
 *                  MAIN FUNCTION                       *
 * **************************************************** */

const App = () => {
  const [library, setLibrary] = useInput('');
  const [password, setPassword] = useInput('');
  const [title, setTitle] = useInput('');
  const [body, setBody] = useInput('');
  const [messages, setMessages] = useState([]);
  const [submit, setSubmit] = useState(false);
  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmit(true);
  };
  useEffect(() => {
    if (submit === false) return; // prevents useEffect runing twice
    if (password === '') return;
    (async () => {
      const {
        eTitle, eBody, iv, salt,
      } = await encrypt(password, body, title);
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
    setSubmit(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submit]);

  const [failedDecrypts, setFailedDecrypts] = useState(0);
  const [getEntries, setGetEntries] = useState(false);
  const [numEntries, setNumEntries] = useState(0);
  const handleGet = (event) => {
    event.preventDefault();
    setGetEntries(true);
  };
  useEffect(() => {
    if (password === '') return;
    const request = new Request(`http://localhost:1337/query/${library}`);
    if (getEntries === true) { // prevents useEffect runing twice
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            console.log('here 103');
            return response.json();
          }
          throw new Error('Something went wrong on api server!');
        })
        .then((response) => {
          for (let i = 0; i < response.length; i += 1) {
            const entry = response[i];
            try {
              (async () => {
                const [t, b, f] = await decrypt(password,
                  new Uint8Array(entry.salt),
                  new Uint8Array(entry.iv),
                  stringToArrayBuffer(entry.title),
                  stringToArrayBuffer(entry.body));
                if (f === 0) {
                  setMessages((m) => [...m, [t, b]]);
                  setNumEntries((num) => (num + 1));
                } else {
                  setFailedDecrypts((num) => num + 1);
                  console.log('here', t, b, f);
                }
              })();
            } catch {
              setFailedDecrypts((num) => num + 1);
              console.log('here127', failedDecrypts);
            }
          }
        }).catch((error) => console.log('error line 123', error));
      //   (async () => {
      //     const [t, b, f] = await decrypt(password,
      //       new Uint8Array(entry.salt),
      //       new Uint8Array(entry.iv),
      //       stringToArrayBuffer(entry.title),
      //       stringToArrayBuffer(entry.body));
      //     if (f === 0) {
      //       setMessages((m) => [...m, [t, b]]);
      //       setNumEntries((num) => (num + 1 ));
      //     } else {
      //       setFailedDecrypts(failedDecrypts + f);
      //     }
      //   }).catch((error) => { console.log('error line 123', error); })();
      // }
      // }).catch((error) => {
      //   // eslint-disable-next-line no-console
      //   console.log('line 129 App.', error);
      // });
      setGetEntries(false);
    }
    // eslint-disable-next-line consistent-return
    return () => { setGetEntries(false); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getEntries]);


  /* **************************************************** *
   *                   RENDER JSX                         *
   * **************************************************** */

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
      {numEntries > 0 && <p>{`decrypted ${numEntries} entries`}</p>}
      {failedDecrypts > 0 && <p>{`failed entries ${failedDecrypts}`}</p>}
      {numEntries === 0 && failedDecrypts > 0 && <p>try another password</p>}
      {numEntries === 0 && failedDecrypts === 0
      && <p>there doesn&#39;t seem to be any notes in that Library!</p>}
      {messages.map((tuple, i) => (
        <>
          <p className="messageTitle">{tuple[0]}</p>
          <p className="messageBody">{tuple[1]}</p>
          {messages.length !== i
          && <div className="msgDivider"> </div>}
        </>
      ))}
    </form>
  );
};


export default App;
