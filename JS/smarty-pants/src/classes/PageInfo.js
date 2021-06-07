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