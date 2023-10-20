import React, { useState, useEffect } from 'react';

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

  function handleSaveClick() {
    // Create a new entry in the database
    const entry = {
      message: message,
    };
    const DBOpenRequest = indexedDB.open(title);
    DBOpenRequest.onerror = (event) => {
      console.error("Why didn't you allow my web app to use IndexedDB?!");
    };
    DBOpenRequest.onsuccess = (event) => {
      console.log('here')
      db = DBOpenRequest.result
      console.log(db)
      addData()
    };
    DBOpenRequest.onupgradeneeded = (event) => {
      // Save the IDBDatabase interface
      const dbInterface = event.target.result;

      // Create an objectStore for this database
      const objectStore = dbInterface.createObjectStore(title, {autoIncrement: true });
    };

    function addData() {
      // Create a new object to insert into the IDB
      const newItem = [
        {
          message,
        },
      ];

      // open a read/write db transaction, ready to add data

      const transaction = db.transaction([title], "readwrite");

      // report on the success of opening the transaction
      transaction.oncomplete = (event) => {
        console.log("<li>Transaction completed: database modification finished.</li>");
      };

      transaction.onerror = (event) => {
        console.log("<li>Transaction not opened due to error. Duplicate items not allowed.</li>");
      };

      // create an object store on the transaction
      const objectStore = transaction.objectStore(title);

      // add our newItem object to the object store
      const objectStoreRequest = objectStore.add(newItem[0]);

      objectStoreRequest.onsuccess = (event) => {
        // report the success of the request (this does not mean the item
        // has been stored successfully in the DB - for that you need transaction.oncomplete)
        console.log("<li>Request successful.</li>");
      };
    }
    handleGetClick()
  }

  function handleGetClick() {
    const DBOpenRequest = indexedDB.open(title);
    console.log(DBOpenRequest)
    DBOpenRequest.onerror = (event) => {
      console.error("Why didn't you allow my web app to use IndexedDB?!");
    };
    DBOpenRequest.onsuccess = (event) => {
      const transaction = event.target.result.transaction([title], 'readonly');
      const objectStore = transaction.objectStore(title);

      // Get all entries with the title entered
      objectStore.getAll().onsuccess = (event) => {
        setSavedEntries(event.target.result);
      };
    };
    DBOpenRequest.onupgradeneeded = (event) => {
      // Save the IDBDatabase interface
      const dbInterface = event.target.result;

      // Create an objectStore for this database
      const objectStore = dbInterface.createObjectStore(title, {autoIncrement: true });
    };
  }

  return (
    <div>
      <h1>Diary</h1>
      <form>
        <label htmlFor="title">Title</label>
        <input type="text" id="title" value={title} onChange={handleTitleChange} />

        <label htmlFor="message">Message</label>
        <textarea id="message" value={message} onChange={handleMessageChange}></textarea>

        <label htmlFor="password">Password (optional)</label>
        <input type="password" id="password" value={password} onChange={handlePasswordChange} />
      </form>

      <button onClick={handleSaveClick}>Save entry</button>
      <button onClick={handleGetClick}>Get</button>
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