import React, { useState, useEffect } from "react";
import "./App.css";
import { FiGithub, FiLogOut, FiExternalLink } from 'react-icons/fi';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [repositories, setRepositories] = useState({});

  const isChromeExtension =
    typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id;

  const checkExistingToken = () => {
    if (isChromeExtension) {
      chrome.storage.local.get("githubToken", function (data) {
        if (data.githubToken) {
          console.log(
            "Token found in local storage, logging in with existing token."
          );
          authenticateWithToken(data.githubToken);
        } else {
          console.log("No token found.");
          setIsAuthenticated(false);
        }
      });
    }
  };

  const authenticateWithToken = (token) => {
    fetchUserInfo(token);
    fetchRepositories(token);
    setIsAuthenticated(true);
  };

  const handleLogin = () => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "authenticate", clientId: process.env.REACT_APP_CLIENT_ID },
        function (response) {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.status === "success" && response.access_token) {
            chrome.storage.local.set({ githubToken: response.access_token }, () => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                chrome.storage.local.get("githubToken", (data) => {
                  console.log("Retrieved GitHub token from storage:", data.githubToken);
                  authenticateWithToken(data.githubToken);
                  resolve(response);
                });
              }
            });
          } else {
            reject(new Error("Authentication failed or invalid response"));
          }
        }
      );
    });
  };

  const fetchUserInfo = (token) => {
    chrome.runtime.sendMessage(
      { action: "fetchUserInfo", access_token: token },
      function (response) {
        if (response.status === "success") {
          console.log("User Data retrieved successfully", response.userData.data);
          setUserInfo(response.userData.data);
        } else {
          console.error("Failed to fetch user info:", response.message);
        }
      }
    );
  };

  const fetchRepositories = (token) => {
    chrome.runtime.sendMessage(
      { action: "fetchRepositories", access_token: token },
      function (response) {
        console.log(response);
        if (response.status === "success") {
          console.log("Repositories retrieved successfully", response.repositories);
          setRepositories(response.repositories);
        } else {
          console.error("Failed to fetch repositories:", response.message);
        }
      }
    );
  };

  const handleLogout = () => {
    if (isChromeExtension) {
      chrome.storage.local.remove("githubToken", function () {
        console.log("GitHub token removed from local storage");
        setIsAuthenticated(false);
        setUserInfo(null);
        setRepositories({});
      });
    }
  };

  useEffect(() => {
    checkExistingToken();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-6">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="bg-gray-800 text-white py-4 px-6">
          <h1 className="text-2xl font-bold flex items-center justify-center">
            <FiGithub className="mr-2" />
            GitHub Repository Manager
          </h1>
        </div>
        <div className="p-6">
          {!isAuthenticated ? (
            <button
              onClick={() => {
                handleLogin().catch((error) => {
                  console.error("Login error:", error.message);
                });
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center"
            >
              <FiGithub className="mr-2" />
              Login with GitHub
            </button>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-700">
                  Logged in as:{" "}
                  <span className="font-semibold text-blue-600">{userInfo ? userInfo.login : 'Loading...'}</span>
                </p>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Your Repositories
              </h2>
              <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
                {Object.entries(repositories).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No repositories found</p>
                ) : (
                  <ul className="space-y-3">
                    {Object.entries(repositories).map(([name, url]) => (
                      <li
                        key={name}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out"
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-between"
                        >
                          <span>{name}</span>
                          <FiExternalLink className="text-gray-400" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        <footer className="bg-gray-100 text-center py-4 text-sm text-gray-600">
          &copy; 2024 GitHub Repo Manager. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default App;
