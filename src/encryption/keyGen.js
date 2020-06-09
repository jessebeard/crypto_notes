/* eslint-disable no-mixed-operators */
/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
/* eslint-disable no-array-constructor */
/* eslint-disable camelcase */
/*
 * JavaScript implementation of Password-Based Key Derivation Function 2
 * (PBKDF2) as defined in RFC 2898.
 * Version 1.5
 * Copyright (c) 2007, 2008, 2009, 2010, 2011, 2012, 2013 Parvez Anandam
 * parvez@anandam.com
 * http://anandam.com/pbkdf2
 *
 * Distributed under the BSD license
 *
 * Uses Paul Johnston's excellent SHA-1 JavaScript library sha1.js:
 * http://pajhome.org.uk/crypt/md5/sha1.html
 * (uses the binb_sha1(), rstr2binb(), binb2str(), rstr2hex() functions from that libary)
 *
 * Thanks to Felix Gartsman for pointing out a bug in version 1.0
 * Thanks to Thijs Van der Schaeghe for pointing out a bug in version 1.1
 * Thanks to Richard Gautier for asking to clarify dependencies in version 1.2
 * Updated contact information from version 1.3
 * Thanks to Stuart Heinrich for pointing out updates to PAJ's SHA-1 library in version 1.4
 */


/*
 * The four arguments to the constructor of the PBKDF2 object are
 * the password, salt, number of iterations and number of bytes in
 * generated key. This follows the RFC 2898 definition: PBKDF2 (P, S, c, dkLen)
 *
 * The method deriveKey takes two parameters, both callback functions:
 * the first is used to provide status on the computation, the second
 * is called with the result of the computation (the generated key in hex).
 *
 * Example of use:
 *
 *    <script src="sha1.js"></script>
 *    <script src="pbkdf2.js"></script>
 *    <script>
 *    let mypbkdf2 = new PBKDF2("mypassword", "saltines", 1000, 16);
 *    let status_callback = function(percent_done) {
 *        document.getElementById("status").innerHTML = "Computed " + percent_done + "%"};
 *    let result_callback = function(key) {
 *        document.getElementById("status").innerHTML = "The derived key is: " + key};
 *    mypbkdf2.deriveKey(status_callback, result_callback);
 *    </script>
 *    <div id="status"></div>
 *
 */

import {
  binb_sha1, rstr2binb, binb2rstr, rstr2hex,
} from './sha1';

function keyGen(password, salt, numIterations, numBytes) {
  // Remember the password and salt
  let mPassword = rstr2binb(password);
  const m_salt = salt;
  // Total number of iterations
  const m_total_iterations = numIterations;
  // Run iterations in chunks instead of all at once, so as to not block.
  // Define size of chunk here; adjust for slower or faster machines if necessary.
  const m_iterations_in_chunk = 10;
  // Iteration counter
  let m_iterations_done = 0;
  // Key length, as number of bytes
  const m_key_length = numBytes;
  // The hash cache
  let m_hash = null;
  // The length (number of bytes) of the output of the pseudo-random function.
  // Since HMAC-SHA1 is the standard, and what is used here, it's 20 bytes.
  const m_hash_length = 20;
  // Number of hash-sized blocks in the derived key (called 'l' in RFC2898)
  const m_total_blocks = Math.ceil(m_key_length / m_hash_length);
  // Start computation with the first block
  let m_current_block = 1;
  // Used in the HMAC-SHA1 computations
  const m_ipad = new Array(16);
  const m_opad = new Array(16);
  // This is where the result of the iterations gets sotred
  let m_buffer = new Array(0x0, 0x0, 0x0, 0x0, 0x0);

  // The result
  let m_key = '';
  // This object
  const m_this_object = this;
  // The function to call with the result
  let m_result_func;
  // The function to call with status after computing every chunk
  let m_status_func;
  // Set up the HMAC-SHA1 computations
  if (mPassword.length > 16) mPassword = binb_sha1(mPassword, password.length * 8);
  for (let i = 0; i < 16; ++i) {
    m_ipad[i] = mPassword[i] ^ 0x36363636;
    m_opad[i] = mPassword[i] ^ 0x5C5C5C5C;
  }

  // Starts the computation
  this.deriveKey = (status_callback, result_callback) => {
    m_status_func = status_callback;
    m_result_func = result_callback;
    setTimeout(() => { m_this_object.do_PBKDF2_iterations(); }, 0);
  };


  // The workhorse
  this.do_PBKDF2_iterations = () => {
    let iterations = m_iterations_in_chunk;
    if (m_total_iterations - m_iterations_done < m_iterations_in_chunk) {
      iterations = m_total_iterations - m_iterations_done;
    }
    for (let i = 0; i < iterations; ++i) {
      // compute HMAC-SHA1
      if (m_iterations_done == 0) {
        const salt_block = m_salt
          + String.fromCharCode(m_current_block >> 24 & 0xF)
          + String.fromCharCode(m_current_block >> 16 & 0xF)
          + String.fromCharCode(m_current_block >> 8 & 0xF)
          + String.fromCharCode(m_current_block & 0xF);

        m_hash = binb_sha1(m_ipad.concat(rstr2binb(salt_block)),
          512 + salt_block.length * 8);
        m_hash = binb_sha1(m_opad.concat(m_hash), 512 + 160);
      } else {
        m_hash = binb_sha1(m_ipad.concat(m_hash),
          512 + m_hash.length * 32);
        m_hash = binb_sha1(m_opad.concat(m_hash), 512 + 160);
      }

      for (let j = 0; j < m_hash.length; ++j) m_buffer[j] ^= m_hash[j];
      m_iterations_done++;
    }

    // Call the status callback function
    // eslint-disable-next-line max-len
    m_status_func(((m_current_block - 1 + m_iterations_done / m_total_iterations) / m_total_blocks) * 100);

    if (m_iterations_done < m_total_iterations) {
      setTimeout(() => { m_this_object.do_PBKDF2_iterations(); }, 0);
    } else if (m_current_block < m_total_blocks) {
      // Compute the next block (T_i in RFC 2898)
      m_key += rstr2hex(binb2rstr(m_buffer));
      m_current_block++;
      m_buffer = new Array(0x0, 0x0, 0x0, 0x0, 0x0);
      m_iterations_done = 0;
      setTimeout(() => { m_this_object.do_PBKDF2_iterations(); }, 0);
    } else {
      // We've computed the final block T_l; we're done.
      const tmp = rstr2hex(binb2rstr(m_buffer));
      m_key += tmp.substr(0, (m_key_length - (m_total_blocks - 1) * m_hash_length) * 2);
      // Call the result callback function
      m_result_func(m_key);
    }
  };
}

export default keyGen;
