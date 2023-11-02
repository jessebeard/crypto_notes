function handleGetClick(input, callback) {
  const DBOpenRequest = indexedDB.open(input.title);
  console.log(DBOpenRequest)
  DBOpenRequest.onerror = (event) => {
    console.error("Why didn't you allow my web app to use IndexedDB?!");
  };
  DBOpenRequest.onsuccess = (event) => {
    const transaction = event.target.result.transaction([input.title], 'readonly');
    const objectStore = transaction.objectStore(input.title);

    // Get all entries with the title entered
    objectStore.getAll().onsuccess = (event) => {
      input.setSavedEntries(event.target.result);
    };
  };
  DBOpenRequest.onupgradeneeded = (event) => {
    // Save the IDBDatabase interface
    const dbInterface = event.target.result;

    // Create an objectStore for this database
    const objectStore = dbInterface.createObjectStore(input.title, {autoIncrement: true });
  };
}
export default handleGetClick