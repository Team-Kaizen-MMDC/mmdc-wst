// ===================================================================
// Storage Module - Cookies
// ===================================================================

// Save a cookie (default 7 days)
export function setCookie(name, value, days = 7) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

// Read a cookie by name
export function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';'); 
  
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    
    //  Remove any leading whitespace from the cookie string (c)
    // This handles both '; ' and ';' separators correctly.
    while (c.charAt(0) === ' ') {
        c = c.substring(1);
    }

    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }

  return "";
}

  // Delete a specific cookie
export function deleteCookie(name) { 
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
}
