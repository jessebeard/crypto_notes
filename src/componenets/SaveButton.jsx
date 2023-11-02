import React from 'react';
import handleSaveClick from "../utilities/handleSaveClick"

function SaveButton(props, callback){

  const setSavedEntries = props.setSavedEntries;

  return (
    <>
      <button
        type="button"
        onClick={setSavedEntries(handleSaveClick(props))}
        className="save-button"
        hovertext="Add this message to the library named in the 'title' field"
      >
      </button> Save
    </>
  );
};

export default SaveButton;
