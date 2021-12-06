import React, { useRef } from 'react';


  return(
    <>
      <input
        type="file"
        accept="image/*"
        id="contained-button-file"
      />
      <label htmlFor="contained-button-file">
        <Button variant="contained" color="primary" component="span">
          Upload
        </Button>
      </label>
    </>
  )

export default UploadButton;
