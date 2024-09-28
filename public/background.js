// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "authenticate") {
//         const clientId = request.clientId; // Use the clientId passed from React
//         // const clientSecret = process.env.REACT_APP_CLIENT_SECRET
//         const redirectUri = chrome.identity.getRedirectURL();
//         const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;

//         chrome.identity.launchWebAuthFlow(
//             {
//                 url: authUrl,
//                 interactive: true,
//             },
//             function (redirectUrl) {
//                 if (chrome.runtime.lastError || !redirectUrl) {
//                     sendResponse({ error: chrome.runtime.lastError.message });
//                     return;
//                 }

//                 const urlParams = new URLSearchParams(new URL(redirectUrl).search);
//                 const code = urlParams.get("code");

//                 fetch("https://github.com/login/oauth/access_token", {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                         Accept: "application/json",
//                     },
//                     body: JSON.stringify({
//                         client_id: clientId,
//                         client_secret: "clientSecret",
//                         code: code,
//                     }),
//                 })
//                     .then((response) => response.json())
//                     .then((data) => {
//                         if (data.error) {
//                             sendResponse({ error: data.error_description });
//                         } else {
//                             chrome.storage.local.set(
//                                 { githubToken: data.access_token },
//                                 () => {
//                                     sendResponse({ success: true });
//                                 }
//                             );
//                         }
//                     });

//                 return true;
//             }
//         );
//     }
// });

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "redirectToYouTube") {
//         chrome.tabs.create({ url: "https://youtube.com" }, () => {
//             console.log("Redirecting");
//             sendResponse({ status: "Redirected to YouTube" });
//         });
//         return true; // Keeps the message channel open for sendResponse
//     }
// });

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "authenticate") {
//         const clientId = request.clientId;
//         const redirectUri = chrome.identity.getRedirectURL();
//         const authenticate_url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        
//         chrome.identity.launchWebAuthFlow({
//             url: authenticate_url,
//             interactive: true
//         }, (redirectUrl) => {
//             if (chrome.runtime.lastError || !redirectUrl) {
//                 sendResponse({ error: chrome.runtime.lastError.message });
//                 return;
//             }
            
//             // Parse the redirect URL to get the authorization code
//             const url = new URL(redirectUrl);
//             const code = url.searchParams.get("code");
            
//             if (code) {
//                 console.log(code);
//                 sendResponse({ status: "success", code: code });
//             } else {
//                 sendResponse({ status: "error", message: "No code received" });
//             }
//         });
        
//         return true; // Indicates that the response is sent asynchronously
//     }
// });


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "authenticate") {
        const authUrl = "http://localhost:5000/auth/github"; // Your Express API
        chrome.tabs.create({ url: authUrl }, (tab) => {
            sendResponse({ status: "authentication started" });
        });
        return true;
    }
});
