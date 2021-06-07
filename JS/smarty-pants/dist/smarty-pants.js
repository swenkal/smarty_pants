class PageInfo {

  constructor(uniqueID, visitID) {
    this.uniqueID = uniqueID;
    this.visitID = visitID;
    this.loadTime = this.getPageLoadTime();
    this.pathName = this.getPagePath();
    this.referrer = this.getPageReferrer();
    this.hitDate = Date.now();
    this.activeTime = 0;
  }

  set newVisitID(value) {
    this.visitID = value;
    this.hitDate = Date.now();
    this.activeTime = 0;
  }

  set newActiveTime(activeTime) {
    this.activeTime = activeTime;
  }

  getPageReferrer() {
    return document.referrer;
  }

  getPagePath() {
    return window.location.pathname;
  }

  getPageLoadTime() {
    const timing = window.performance.timing;
    const loadTime = timing.domContentLoadedEventEnd - timing.navigationStart;
    return loadTime;
  }
}

/*next file*/

class Visit {

  constructor(uniqueID, visitID, cookieAgree) {
    this.uniqueID = uniqueID;
    this.visitID = visitID;
    this.cookieAgree = cookieAgree;
    this.browser = this.defineBrowser();
    this.screenWidth = this.getScreenWidth();
    this.screenHeight = this.getScreenHeight()
    this.createDate = Date.now();
  }

  set newVisitID(value) {
    this.visitID = value;
    this.createDate = Date.now();
  }

  getScreenWidth() {
    return window.screen.width;
  }

  getScreenHeight() {
    return window.screen.height;
  }

  defineBrowser() {
    const usrAg = navigator.userAgent;
    let browser = "Some browser";

    //обычные браузеры
    if (usrAg.search(/Safari/) > 0) browser = 'Safari' ;
    if (usrAg.search(/Firefox/) > 0) browser = 'Firefox';
    if (usrAg.search(/MSIE/) > 0 ||
        usrAg.search(/NET CLR /) > 0) browser = 'IE PC';
    if (usrAg.search(/Chrome/) > 0) browser = 'Google Chrome';
    if (usrAg.search(/YaBrowser/) > 0) browser = 'Yandex Browser';
    if (usrAg.search(/OPR/) > 0) browser = 'Opera PC';
    if (usrAg.search(/Konqueror/) > 0) browser = 'Konqueror';
    if (usrAg.search(/Iceweasel/) > 0) browser = 'Debian Iceweasel';
    if (usrAg.search(/SeaMonkey/) > 0) browser = 'SeaMonkey';
    if (usrAg.search(/Edge/) > 0) browser = 'MS Edge (Old)';
    if (usrAg.search(/Edg/) > 0) browser = 'MS Edge (Chrome Engine)';

    //мобильные браузеры
    if (usrAg.search(/UCBrowser/i) > 0) browser = 'UC Browser';
    if (usrAg.search(/Opera Mini/i) > 0) browser = 'Opera Mini';
    if (usrAg.search(/iPhone|iPad|iPod/i) > 0) browser = 'Apple iOS';
    if (usrAg.search(/BlackBerry/i) > 0) browser = 'Blackberry Device';
    if (usrAg.search(/IEMobile/i) > 0) browser = 'IE Mobile';
    if (usrAg.search(/Android/i) > 0) browser = 'Android Device';
    if (usrAg.search(/Samsung/i) > 0) browser = 'Samsung Internet';

    return browser;
  }
}

/*next file*/

// возвращает куки с указанным name,
// или undefined, если ничего не найдено
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {

  options = {
    path: '/',
    // при необходимости добавьте другие значения по умолчанию
    ...options
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

function deleteCookie(name) {
  setCookie(name, "", {
    'max-age': -1
  })
}


/*next file*/

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


/*next file*/

(()=>{((a,b)=>{if("undefined"!=typeof module&&module.exports)return module.exports=b();return"function"==typeof define&&define.amd?void define([],()=>a.TimeMe=b()):a.TimeMe=b()})(this,()=>{let a={startStopTimes:{},idleTimeoutMs:30000,currentIdleTimeMs:0,checkIdleStateRateMs:250,isUserCurrentlyOnPage:!0,isUserCurrentlyIdle:!1,currentPageName:"default-page-name",userLeftCallbacks:[],userReturnCallbacks:[],startTimer:(b,c)=>{if(b||(b=a.currentPageName),void 0===a.startStopTimes[b])a.startStopTimes[b]=[];else{let c=a.startStopTimes[b],d=c[c.length-1];if(void 0!==d&&void 0===d.stopTime)return}a.startStopTimes[b].push({startTime:c||new Date,stopTime:void 0})},stopAllTimers:()=>{let b=Object.keys(a.startStopTimes);for(let c=0;c<b.length;c++)a.stopTimer(b[c])},stopTimer:(b,c)=>{b||(b=a.currentPageName);let d=a.startStopTimes[b];void 0===d||0===d.length||d[d.length-1].stopTime===void 0&&(d[d.length-1].stopTime=c||new Date)},getTimeOnCurrentPageInSeconds:()=>a.getTimeOnPageInSeconds(a.currentPageName),getTimeOnPageInSeconds:b=>{let c=a.getTimeOnPageInMilliseconds(b);return void 0===c?void 0:c/1e3},getTimeOnCurrentPageInMilliseconds:()=>a.getTimeOnPageInMilliseconds(a.currentPageName),getTimeOnPageInMilliseconds:b=>{let c=0,d=a.startStopTimes[b];if(void 0===d)return;let e=0;for(let a=0;a<d.length;a++){let b=d[a].startTime,c=d[a].stopTime;void 0===c&&(c=new Date);let f=c-b;e+=f}return c=+e,c},getFocusLostCountOnPage:b=>(b||(b=a.currentPageName),a.startStopTimes[b].length),setIdleDurationInSeconds:b=>{let c=parseFloat(b);if(!1===isNaN(c))a.idleTimeoutMs=1e3*b;else throw{name:"InvalidDurationException",message:"An invalid duration time ("+b+") was provided."}},setCurrentPageName:b=>{a.currentPageName=b},resetRecordedPageTime:b=>{delete a.startStopTimes[b]},resetAllRecordedPageTimes:()=>{let b=Object.keys(a.startStopTimes);for(let c=0;c<b.length;c++)a.resetRecordedPageTime(b[c])},userActivityDetected:()=>{a.isUserCurrentlyIdle&&a.triggerUserHasReturned(),a.resetIdleCountdown()},resetIdleCountdown:()=>{a.isUserCurrentlyIdle=!1,a.currentIdleTimeMs=0},callWhenUserLeaves:(b,c)=>{a.userLeftCallbacks.push({callback:b,numberOfTimesToInvoke:c})},callWhenUserReturns:(b,c)=>{a.userReturnCallbacks.push({callback:b,numberOfTimesToInvoke:c})},triggerUserHasReturned:()=>{if(!a.isUserCurrentlyOnPage){a.isUserCurrentlyOnPage=!0,a.resetIdleCountdown();for(let b=0;b<a.userReturnCallbacks.length;b++){let c=a.userReturnCallbacks[b],d=c.numberOfTimesToInvoke;(isNaN(d)||d===void 0||0<d)&&(c.numberOfTimesToInvoke-=1,c.callback())}}a.startTimer()},triggerUserHasLeftPageOrGoneIdle:()=>{if(a.isUserCurrentlyOnPage){a.isUserCurrentlyOnPage=!1;for(let b=0;b<a.userLeftCallbacks.length;b++){let c=a.userLeftCallbacks[b],d=c.numberOfTimesToInvoke;(isNaN(d)||d===void 0||0<d)&&(c.numberOfTimesToInvoke-=1,c.callback())}}a.stopAllTimers()},checkIdleState:()=>{!1===a.isUserCurrentlyIdle&&a.currentIdleTimeMs>a.idleTimeoutMs?(a.isUserCurrentlyIdle=!0,a.triggerUserHasLeftPageOrGoneIdle()):a.currentIdleTimeMs+=a.checkIdleStateRateMs},visibilityChangeEventName:void 0,hiddenPropName:void 0,listenForVisibilityEvents:(b,c)=>{b&&a.listenForUserLeavesOrReturnsEvents(),c&&a.listForIdleEvents()},listenForUserLeavesOrReturnsEvents:()=>{"undefined"==typeof document.hidden?"undefined"==typeof document.mozHidden?"undefined"==typeof document.msHidden?"undefined"!=typeof document.webkitHidden&&(a.hiddenPropName="webkitHidden",a.visibilityChangeEventName="webkitvisibilitychange"):(a.hiddenPropName="msHidden",a.visibilityChangeEventName="msvisibilitychange"):(a.hiddenPropName="mozHidden",a.visibilityChangeEventName="mozvisibilitychange"):(a.hiddenPropName="hidden",a.visibilityChangeEventName="visibilitychange"),document.addEventListener(a.visibilityChangeEventName,()=>{document[a.hiddenPropName]?a.triggerUserHasLeftPageOrGoneIdle():a.triggerUserHasReturned()},!1),window.addEventListener("blur",()=>{a.triggerUserHasLeftPageOrGoneIdle()}),window.addEventListener("focus",()=>{a.triggerUserHasReturned()})},listForIdleEvents:()=>{document.addEventListener("mousemove",()=>{a.userActivityDetected()}),document.addEventListener("keyup",()=>{a.userActivityDetected()}),document.addEventListener("touchstart",()=>{a.userActivityDetected()}),window.addEventListener("scroll",()=>{a.userActivityDetected()}),setInterval(()=>{!0!==a.isUserCurrentlyIdle&&a.checkIdleState()},a.checkIdleStateRateMs)},initialize:b=>{let c,d=a.idleTimeoutMs||30,e=a.currentPageName||"default-page-name",f=!0,g=!0;b&&(d=b.idleTimeoutInSeconds||d,e=b.currentPageName||e,c=b.initialStartTime,!1===b.trackWhenUserLeavesPage&&(f=!1),!1===b.trackWhenUserGoesIdle&&(g=!1)),a.setIdleDurationInSeconds(d),a.setCurrentPageName(e),a.listenForVisibilityEvents(f,g),a.startTimer(void 0,c)}};return a})}).call(this);

/*next file*/

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


/*next file*/

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