import handleGetClick from "./handleGetClick"

function handleSaveClick(props, callback) {
  // Create a new entry in the database
  let db
  const entry = {
    message: props.message,
  };
  const DBOpenRequest = indexedDB.open(props.title);
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
    const objectStore = dbInterface.createObjectStore(props.title, {autoIncrement: true });
  };

  const addData = () => {
    // Create a new object to insert into the IDB
    const newItem = [
      {
        message:props.message,
      },
    ];

    // open a read/write db transaction, ready to add data
    const transaction = db.transaction([props.title], "readwrite");

    // report on the success of opening the transaction
    transaction.oncomplete = (event) => {
      console.log("Transaction completed: database modification finished.");
    };

    transaction.onerror = (event) => {
      console.log("Transaction not opened due to error. Duplicate items not allowed.");
    };

    // create an object store on the transaction
    const objectStore = transaction.objectStore(props.title);

    // add our newItem object to the object store
    const objectStoreRequest = objectStore.add(newItem[0]);

    objectStoreRequest.onsuccess = (event) => {
      // report the success of the request (this does not mean the item
      // has been stored successfully in the DB - for that you need transaction.oncomplete)
      console.log("Request successful.");
    };
  }
  handleGetClick(props)
  return db
}

export default handleSaveClick
