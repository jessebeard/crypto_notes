import React, { useState, useEffect } from 'react';

const DeleteButton = ({rowId}) => {
  const [toDelete, setToDelete] = useState(false);
  const handleDelete = (event) => {
    event.preventDefault();
    setToDelete(true);
  };
  useEffect(() => {
    const request = new Request(`http://localhost:1337/delete/${rowId}`, { method: 'DELETE' });
    if (toDelete === true) { // prevents useEffect running twice
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            console.log(response.json());
            //return response.json();
          }
          throw new Error('Something went wrong on api server!');
        })
        .catch((error) => console.log('error in deleteButton', error));
      setToDelete(false);
    }
    // eslint-disable-next-line consistent-return
    return () => { setToDelete(false); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toDelete]);


  return (
    <button
      onClick={handleDelete}>
    </button>
  )
};

export default DeleteButton;