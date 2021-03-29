/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */
/* eslint-disable comma-dangle */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import useInput from './utilities/useInput';
import encrypt from './encryption/encrypt';
import decrypt from './encryption/decrypt';
import DeleteButton from './artifacts/DeleteButton';
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
  const [numDecrypted, setNumDecrypted] = useState(0);
  const [numEncrypted, setNumEncrypted] = useState(0);
  const [numDeleted, setNumDeleted] = useState(0);
  const [currentLibrary, setCurrentLibrary] = useState('');
  const [submit, setSubmit] = useState(false);
  const [queried, setQueried] = useState(false);

  /* *********************************************************
   *               Encrypt & add                             *
   ********************************************************* */

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
            if (currentLibrary.length === 0) setCurrentLibrary(library);
            return response.json();
          }
          throw new Error('Something went wrong on api server!');
        })
        .then((response) => {
          const { id } = response;
          console.log(response, id, 84, currentLibrary, library);
          if (currentLibrary === library) {
            setMessages((m) => [...m, { title, body, id }]);
            setNumEncrypted((num) => (num + 1));
          }
          if (currentLibrary === '') {
            setMessages([{ title, body, id }]);
            setNumEncrypted(1);
          }
        }).catch((error) => {
          alert(error);
        });
    })();
    setSubmit(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submit]);

  /* **************************************************************
  *                      Get & Decrypt                           *
  ************************************************************** */

  const [failedDecrypts, setFailedDecrypts] = useState(0);
  const [getEntries, setGetEntries] = useState(false);
  const handleGet = (event) => {
    event.preventDefault();
    setGetEntries(true);
  };
  useEffect(() => {
    if (password === '') return;
    if (library === currentLibrary) return; // <--- this is why i can't get it to add diff passwords
    // ? store the message content in a set of objects by ID?
    const request = new Request(`http://localhost:1337/query/${library}`);
    if (getEntries === true) { // prevents useEffect running twice
      setMessages([]);
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
        })
        .then((response) => {
          if (response.length === 0) {
            setQueried(true);
            setFailedDecrypts(0);
            setNumDecrypted(0);
          } else {
            for (let i = 0; i < response.length; i += 1) {
              const entry = response[i]; // this is raw row recieved from the database
              const rowId = entry.id;
              try {
                (async () => {
                  const [t, b, f] = await decrypt( // title, body, fail
                    password,
                    new Uint8Array(entry.salt),
                    new Uint8Array(entry.iv),
                    stringToArrayBuffer(entry.title),
                    stringToArrayBuffer(entry.body)
                  );
                  if (f === 0) {
                    setMessages((m) => [...m,
                      { title: t, body: b, id: rowId }]);
                    setNumDecrypted((num) => (num + 1));
                    setQueried(true);
                    setCurrentLibrary(library);
                  } else {
                    setFailedDecrypts((num) => num + 1);
                  }
                })();
              } catch {
                setFailedDecrypts((num) => num + 1);
              }
            }
          }
        }).catch((error) => console.log('error line 123', error));
      setGetEntries(false);
    }
    // eslint-disable-next-line consistent-return
    return () => { setGetEntries(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getEntries]);

  /* *******************************************************************
  *                       Remove Deletion                             *
  ******************************************************************* */
  // const [deleted, setDeleted] = useState(false);
  const messageSet = new Set();
  messages.forEach((m) => messageSet.add(m));
  const deleteMessage = (m) => {
    messageSet.forEach((entry) => {
      if (entry.id === m) {
        messageSet.delete(entry);
        setMessages(Array.from(messageSet));
        setNumDeleted((num) => (num + 1));
      }
    });
    // setDeleted(true);
  };
  // useEffect(() => {
  //   console.log('here 172', messageSet)
  //   if (deleted === true) {
  //     setMessages(Array.from(messageSet))
  //     console.log('177', messageSet, messages)
  // }
  //   return () => { setDeleted(false); };
  // }, [deleted, messages]);
  /* **************************************************** *
   *                   RENDER JSX                         *
   * **************************************************** */

  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      id="inputForm"
    >
      <label>
        Library?
        <input
          required
          type="text"
          placeholder="e.g. Diary"
          value={library}
          onChange={setLibrary}
          id="libraryInput"
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
          id="passwordInput"
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
          id="titleInput"
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
          id="bodyInput"
        />
      </label>
      <div className="divider" />
      <div className="divider" />
      <button
        type="submit"
        id="addEntry"
      >
        Submit
      </button>
      <button
        type="button"
        onClick={(e) => handleGet(e)}
        id="retrieveEntries"
      >
        Get Notes and Decrypt
      </button>
      {numDecrypted === 0 && failedDecrypts === 0
        && numEncrypted === 0 && <p>Enter a Library!</p>}
      {numDecrypted > 0 && <p>{`decrypted ${numDecrypted} entries`}</p>}
      {failedDecrypts > 0 && <p>{`failed entries ${failedDecrypts} on the last run!`}</p>}
      {numDecrypted === 0 && failedDecrypts > 0
       && <p>try another password</p>}
      {numDecrypted === 0 && failedDecrypts === 0 && numEncrypted === 0
      && queried === true && <p>There doesn&#39;t seem to be any notes in that Library!</p>}
      { numEncrypted > 0 && <p>{`encrypted and added ${numEncrypted}`}</p> }
      { numDeleted > 0 && <p>{`deleted ${numDeleted} entries`}</p> }
      {Array.from(messageSet).map((obj, i) => {
        const titleId = `title${obj.id}`;
        const bodyId = `body${obj.id}`;
        const deleteId = `delete${obj.id}`;
        return (
          <>
            <p
              className="messageTitle"
              key={titleId}
              id={titleId}
            >
              {obj.title}
            </p>
            <p
              className="messageBody"
              key={bodyId}
              id={bodyId}
            >
              {obj.body}
            </p>
            <DeleteButton rowId={obj.id} action={deleteMessage} key={deleteId} />
            {messages.length !== i - 1 && <div className="msgDivider"> </div>}
          </>
        );
      })}
    </form>
  );
};

export default App;
