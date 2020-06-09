/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
// import regeneratorRuntime from 'regenerator-runtime';
import useInput from './utilities/useInput';
import encrypt from './encryption/encrypt';

const App = () => {
  const [library, setLibrary] = useInput('');
  const [password, setPassword] = useInput('');
  const [title, setTitle] = useInput('');
  const [body, setBody] = useInput('');
  // const [messages, setMessages] = useState();
  // this.handleSubmit = this.handleSubmit.bind(this);
  const [submit, setSubmit] = useState(false);
  useEffect(() => {
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
          title,
          body,
        }),
      };
      const request = new Request('http://localhost:1337/submit/', myInit);
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
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
  }, [submit]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmit(true);
  };


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
    </form>
  );
};


export default App;
