// Detect use of local storage and session storage
let localStorageDetected = localStorage.length > 0;
let sessionStorageDetected = sessionStorage.length > 0;

console.log("Content script loaded: LocalStorage detected:", localStorageDetected, "SessionStorage detected:", sessionStorageDetected);

// Detect dynamic script injection (for hijacking detection)
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'SCRIPT') {
          browser.runtime.sendMessage({ action: 'hijackingDetected' });
        }
      });
    }
  });
});
observer.observe(document.documentElement, { childList: true, subtree: true });

// Override canvas to detect fingerprinting
HTMLCanvasElement.prototype.toDataURL = (function(originalFn) {
  return function() {
    browser.runtime.sendMessage({ action: 'canvasFingerprintDetected' });
    return originalFn.apply(this, arguments);
  };
})(HTMLCanvasElement.prototype.toDataURL);

// Listen for messages from the popup to send local storage data
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getLocalStorage') {
    console.log("Received request for local storage data. Sending response...");
    sendResponse({
      localStorageDetected: localStorageDetected,
      sessionStorageDetected: sessionStorageDetected
    });
  }
});
