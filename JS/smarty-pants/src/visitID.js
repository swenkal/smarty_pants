/*CHECK visit ID and SET if not exist*/
function getVisitID() {
  let visitID = getCookie('visitID');
  console.log(document.cookie);
  console.log(`VisitID from cookies: ${visitID}`);
  if (visitID === undefined) {
    visitID = generateVisitID();
    setCookie('visitID', visitID);
  }

  //console.log('visitID: ' + visitID);
  return visitID;
}

function generateVisitID() {
  const milisec = Date.now();
  const randomInt = Math.floor(Math.random() * 90000) + 10000;
  return `${milisec}${randomInt}`;
}