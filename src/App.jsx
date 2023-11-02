import React, { useState, useEffect } from 'react';
import SaveButton from "./componenets/SaveButton";
import handleGetClick from "./utilities/handleGetClick";

function App() {
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [savedEntries, setSavedEntries] = React.useState([]);
  let db;

  function handleTitleChange(event) {
    setTitle(event.target.value);
  }

  function handleMessageChange(event) {
    setMessage(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }



  return (
    <div>
      <h1>Diary</h1>
      <form>
        <label htmlFor="title">Title</label>
        <input type="text" id="title" value={title} onChange={handleTitleChange} />
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={message}
          onChange={handleMessageChange}
          ></textarea>
        <label htmlFor="password">Password (optional)</label>
        <input type="password" id="password" value={password} onChange={handlePasswordChange} />
      </form>

      <SaveButton
        title={title}
        message={message}
        password={password}
        setSavedEntries={setSavedEntries}
        >Save entry</SaveButton>
      {//<button onClick={handleGetClick({title, db})}>Get</button>
      }
      <h2>Saved entries:</h2>
      {savedEntries.map(entry => (
        <div key={entry.id}>
          <h3>{entry.title}</h3>
          <p>{entry.message}</p>
        </div>
      ))}
    </div>
  );
}

export default App;