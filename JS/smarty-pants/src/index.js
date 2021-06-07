const VISIT_TIME_MS = 15 * 1000, //after 30 minutes visitID will delete
  IDLE_TIMEOUT_SEC = 10, //idleTimeoutInSeconds
  ANALYTICS_HOST = 'http://localhost:5000',
  PAGE_INFO_URL = `${ANALYTICS_HOST}pages`,
  VISIT_INFO_URL = `${ANALYTICS_HOST}visits`;


let startIdleMs = 0,
  leaveTimer;
/*declare class instances*/
let pageInfo, visit;

window.addEventListener('load', grabKnowning);
window.addEventListener('beforeunload', sendPageInfo);

function grabKnowning() {

  TimeMe.initialize({
    idleTimeoutInSeconds: IDLE_TIMEOUT_SEC, // stop recording time due to inactivity
  });

  let sendVisitInfo = false
  if (getCookie('visitID') === undefined) sendVisitInfo = true;

  /*common metrics*/
  const uniqueID = getUniqueID();
  const visitID = getVisitID();

  /*visit metrics*/
  const cookieAgree = getCookieAgreement();

  /*create visit example*/
  visit = new Visit(uniqueID, visitID, cookieAgree);
  console.log(`Visit class: ${JSON.stringify(visit)}`);
  if (sendVisitInfo) navigator.sendBeacon(`${ANALYTICS_HOST}/visits`, JSON.stringify(visit));

  pageInfo = new PageInfo(uniqueID, visitID);
  console.log(`PageInfo class: ${JSON.stringify(pageInfo)}`);

  TimeMe.callWhenUserLeaves(() => {
    startIdleMs = Date.now();

    leaveTimer = setTimeout( () => {
      pageInfo.newActiveTime = TimeMe.getTimeOnCurrentPageInMilliseconds();
      navigator.sendBeacon(`${ANALYTICS_HOST}/pages`, JSON.stringify(pageInfo));
      TimeMe.resetRecordedPageTime(TimeMe.currentPageName);
    }, VISIT_TIME_MS);
  });

  // Executes every time a user returns
  TimeMe.callWhenUserReturns(() => {
    let idleMs = Date.now() - startIdleMs;
    clearTimeout(leaveTimer);

    if (idleMs > VISIT_TIME_MS) {
      visit.newVisitID = generateVisitID()
      setCookie('visitID', visit.visitID);
      //pageInfo.newActiveTime = TimeMe.getTimeOnCurrentPageInMilliseconds();
      //navigator.sendBeacon(`${ANALYTICS_HOST}/pages`, JSON.stringify(pageInfo));
      //TimeMe.resetRecordedPageTime(TimeMe.currentPageName);
      navigator.sendBeacon(`${ANALYTICS_HOST}/visits`, JSON.stringify(visit));
      TimeMe.startTimer();
      pageInfo.newVisitID = visit.visitID;
      console.log(JSON.stringify(visit));
      console.log(JSON.stringify(pageInfo));
    }

    startIdleMs = 0;
  });
}

function sendPageInfo() {
  pageInfo.newActiveTime = TimeMe.getTimeOnCurrentPageInMilliseconds();
  navigator.sendBeacon(`${ANALYTICS_HOST}/pages`, JSON.stringify(pageInfo));
}

//TODO: add modal window with accepting cookie
function getCookieAgreement(){
  return true;
}
