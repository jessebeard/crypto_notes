import * as React from 'react';

function SvgXDelete(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 8 8"
      width="1em"
      height="1em"
      className="delete-icon"
      {...props}
    >
      <g fillRule="evenodd">
        <path d="M2.048.77l5.18 5.182L5.953 7.23.77 2.048 2.048.77z" />
        <path d="M5.952.77L7.23 2.05 2.048 7.23.77 5.952 5.953.772z" />
      </g>
    </svg>
  );
}

export default SvgXDelete;
