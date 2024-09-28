/* global chrome */
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [repositories, setRepositories] = useState([]);

  const isChromeExtension = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id;

  useEffect(() => {
    if (isChromeExtension) {
      // checkAuthentication();
      console.log(isAuthenticated);
    }
  }, []);

  const checkAuthentication = () => {
    chrome.storage.local.get("githubToken", function (data) {
      if (data.githubToken) {
        setIsAuthenticated(true);
        fetchUserInfo();
        fetchRepositories();
      }
    });
  };

  const handleLogin = () => {
    // window.location.assign("https://github.com/login/oauth/authorize?client_id="+process.env.REACT_APP_GITHUB_CLIENT_ID);
    // console.log("hllo");
    chrome.runtime.sendMessage(
      { action: "authenticate", clientId: process.env.REACT_APP_CLIENT_ID },
      function (response) {
        if (response.error) {
          console.error("Authentication failed:", response.error);
        } else {
          setIsAuthenticated(true);
          // checkAuthentication();
        }
      }
    );
  };

  // const handleLogin = () => {
  //   // Check if the chrome object is available (indicating we're in an extension)
  //   const isChromeExtension = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id;
  
  //   if (isChromeExtension) {
  //     // Send a message to the background script to trigger the redirection to YouTube
  //     chrome.runtime.sendMessage({ action: "redirectToYouTube" }, (response) => {
  //       if (response && response.status === "Redirected to YouTube") {
  //         console.log("Successfully redirected to YouTube");
  //       } else {
  //         console.error("Failed to redirect or no response from background script");
  //       }
  //     });
  //   } else {
  //     console.error("Chrome runtime not available.");
  //   }
  // };
  

  const fetchUserInfo = () => {
    chrome.runtime.sendMessage(
      { action: "fetchUserInfo" },
      function (response) {
        if (response.error) {
          console.error("Failed to fetch user info:", response.error);
        } else {
          setUserInfo(response);
        }
      }
    );
  };

  const fetchRepositories = () => {
    chrome.runtime.sendMessage(
      { action: "fetchRepositories" },
      function (response) {
        if (response.error) {
          console.error("Failed to fetch repositories:", response.error);
        } else {
          setRepositories(response);
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          GitHub Repository Manager
        </h1>
        {!isAuthenticated ? (
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Login with GitHub
          </button>
        ) : ( 
        <div> 
          {userInfo && (
              <p className="text-gray-700 mb-4 text-center">
                Logged in as:{" "}
                <span className="font-semibold">{userInfo.login}</span>
              </p>
            )}
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Your Repositories:
            </h2>
            <ul className="space-y-3">
              {repositories.map((repo) => (
                <li
                  key={repo.id}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded transition duration-200 ease-in-out"
                >
                  {repo.name}
                </li>
              ))}
            </ul> 
          </div>
        )} 
      </div>
    </div>
  );
}

export default App;
