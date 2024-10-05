import apiClient from "./config/apiClient.js";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "authenticate") {
        const clientId = request.clientId;
        const redirectUri = chrome.identity.getRedirectURL();
        const authenticate_url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

        chrome.identity.launchWebAuthFlow({
            url: authenticate_url,
            interactive: true
        }, (redirectUrl) => {
            if (chrome.runtime.lastError || !redirectUrl) {
                sendResponse({ error: chrome.runtime.lastError ? chrome.runtime.lastError.message : "No redirect URL" });
                return;
            }

            const url = new URL(redirectUrl);
            const code = url.searchParams.get("code");

            if (code) {
                console.log(`Authorization code: ${code}`);
                apiClient.post('/auth/github/callback', { code: code })
                    .then(response => {
                        console.log(response);
                        const { access_token } = response.data.data;
                        console.log('Access Token:', access_token);
                        sendResponse({ status: "success", access_token });
                    })
                    .catch(err => {
                        console.error('Error sending authorization code:', err);
                        sendResponse({ status: "error", message: "Failed to get access token" });
                    });
            } else {
                sendResponse({ status: "error", message: "No code received" });
            }
        });

        return true; // Keep the message channel open for the asynchronous response
    }
    else if (request.action === "fetchUserInfo") {
        const accessToken = request.access_token;
        apiClient.get('/auth/getUserData', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => {
            console.log('User Data:', response.data);
            sendResponse({ status: "success", userData: response.data });
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            sendResponse({ status: "error", message: "Failed to retrieve user data" });
        });

        return true; // Keep the message channel open for the asynchronous response
    }
    else if(request.action === "fetchRepositories"){
        const accessToken = request.access_token;
        
        apiClient.get('/auth/getUserRepos', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => {
            console.log('User Repositories:', response.data);
            sendResponse({ 
                status: "success", 
                message: "Repositories fetched successfully",
                repositories: response.data.data  
            });
        })
        .catch(error => {
            console.error('Error fetching repositories:', error);
            sendResponse({ 
                status: "error", 
                message: "Failed to retrieve repositories",
                error: error.response ? error.response.data : error.message
            });
        });

        return true; // Keep the message channel open for the asynchronous response
    }
});

chrome.runtime.onInstalled.addListener(() => {
    console.log('Service Worker registered successfully');

    // Set an alarm to keep the service worker alive if necessary
    chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
        console.log('Keep-alive alarm triggered');
    }
});
