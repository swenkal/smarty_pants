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