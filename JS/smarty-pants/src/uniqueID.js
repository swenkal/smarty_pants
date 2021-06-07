/* get unique ID from cookies,
   or generate new unique ID and set cookiest*/
function getUniqueID() {

  let uniqueID = getCookie('uniqueID'); //in cookie.js
  if (uniqueID) return uniqueID;

  uniqueID = localStorage.getItem('uniqueID');
  if (uniqueID) {
    setCookie('uniqueID', uniqueID, { 'Max-Age': 86400 * 30 });
    return uniqueID;
  }

  uniqueID = generateUniqueID();
  localStorage.setItem('uniqueID', uniqueID);
  setCookie('uniqueID', uniqueID, { 'Max-Age': 86400 * 30 }); //in cookie.js

  return uniqueID;
}

function generateUniqueID() {
  const milisec = Date.now();
  const randomInt = Math.floor(Math.random() * 90000) + 10000;
  return `${randomInt}${milisec}`;
}
