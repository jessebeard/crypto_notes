import React, { useState, useEffect } from 'react';

const DeleteButton = ({rowId, action}) => {
  const [toDelete, setToDelete] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const handleDelete = (event) => {
    setToDelete(true);
  };
  useEffect(() => {
    const request = new Request(`http://localhost:1337/delete/${rowId}`, { method: 'DELETE' });
    if (toDelete === true) { // prevents useEffect running twice
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            action(rowId)
            setIsDeleted(true)
            //return response.json();
          } else {
            throw new Error('Something went wrong on api server!');
          }
        })
        .catch((error) => console.log('error in deleteButton', error));
      setToDelete(false);
    }
    // eslint-disable-next-line consistent-return
    return () => { setToDelete(false); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toDelete]);


  return (
    <>
      <button
        type="button"
        onClick={handleDelete}
      >
        x
      </button>
    </>
  )};

export default DeleteButton;
