// Function to show "Loading..." placeholder while waiting for data
function showLoadingState() {
    document.getElementById('hijacking-status').textContent = "Loading...";
    document.getElementById('local-storage-status').textContent = "Loading...";
    document.getElementById('cookie-data').textContent = "Loading...";
    document.getElementById('canvas-fingerprint-status').textContent = "Loading...";
    document.getElementById('privacy-score').textContent = "Loading...";
    document.getElementById('third-party-connections').textContent = "Loading..."; // Placeholder for third-party connections
  }
  
  // Function to fetch and update extension data
  function fetchData() {
    console.log("Fetching data...");
    // Show "Loading..." while waiting for the data
    showLoadingState();
  
    // Request data from the background script and display it in the popup
    browser.runtime.sendMessage({ action: "getExtensionData" }).then(response => {
      console.log("Data received from background:", response);
  
      // Display browser hijacking status
      document.getElementById('hijacking-status').textContent = response.hijackingDetected ? 'Detected' : 'Not detected';
  
      // Display local storage status
      browser.runtime.sendMessage({ action: 'getLocalStorage' }).then(storageResponse => {
        if (storageResponse) {
          document.getElementById('local-storage-status').textContent =
            `LocalStorage: ${storageResponse.localStorageDetected ? 'Yes' : 'No'}, SessionStorage: ${storageResponse.sessionStorageDetected ? 'Yes' : 'No'}`;
        } else {
          document.getElementById('local-storage-status').textContent = "Error retrieving storage data.";
        }
      }).catch(error => {
        console.error("Error receiving storage data:", error);
        document.getElementById('local-storage-status').textContent = "Error retrieving storage data.";
      });
  
      // Display cookie data summary
      const cookieText = `First-Party: ${response.cookieData.firstParty}, Third-Party: ${response.cookieData.thirdParty}, 
                          Session: ${response.cookieData.sessionCookies}, Persistent: ${response.cookieData.persistentCookies}`;
      document.getElementById('cookie-data').textContent = cookieText;
  
      // Display canvas fingerprinting status
      document.getElementById('canvas-fingerprint-status').textContent = response.canvasFingerprintDetected ? 'Detected' : 'Not detected';
  
      // Display privacy score
      document.getElementById('privacy-score').textContent = `Privacy Score: ${response.privacyScore}`;
  
      // Display the number of third-party connections
      const thirdPartyCount = response.thirdPartyConnections.length;
      document.getElementById('third-party-connections').textContent = `Third-Party Connections: ${thirdPartyCount}`;
    }).catch(error => {
      console.error("Error receiving data from background script:", error);
    });
  }
  
  // Run fetchData() when the popup loads
  document.addEventListener('DOMContentLoaded', (event) => {
    console.log("Popup loaded");
    fetchData(); // Fetch data when the popup is first opened
  
    // Add event listener to the reload button
    const reloadButton = document.getElementById('reload-btn');
    if (reloadButton) {
      reloadButton.addEventListener('click', () => {
        console.log("Reload button clicked");
  
        // Show "Loading..." immediately when reload is clicked
        showLoadingState();
  
        // Reset data and reload tab
        browser.runtime.sendMessage({ action: "resetData" }).then(() => {
          // Introduce a delay to allow the page to make requests after the reload
          console.log("Resetting data...");
  
          // Delay the fetching of new data by 3 seconds (3000 milliseconds)
          setTimeout(() => {
            console.log("Fetching data after delay...");
            fetchData(); // Fetch new data after the delay
          }, 3000); // 3-second delay to allow requests to be captured
        }).catch(error => {
          console.error("Error resetting data:", error);
        });
      });
    } else {
      console.error("Reload button not found");
    }
  });
  