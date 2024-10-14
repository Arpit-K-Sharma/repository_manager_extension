import React, { useState, useEffect } from "react";
import { FiGithub, FiLogOut, FiExternalLink, FiChevronDown, FiChevronUp, FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [repositories, setRepositories] = useState({});
  const [showRepositories, setShowRepositories] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showUpdateCategory, setShowUpdateCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [updatedCategoryName, setUpdatedCategoryName] = useState("");
  const [showDeleteCategory, setShowDeleteCategory] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [isDeleteRepoOpen, setIsDeleteRepoOpen] = useState(false);
  const [currentRepositoryID, setCurrentRepositoryID] = useState({});


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

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const filteredRepositories = Object.entries(repositories).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
          setCategories(response.userData.data.category || []);
        } else {
          console.error("Failed to fetch user info:", response.message);
        }
      }
    );
  };

  const fetchCategories = (userId) => {
    if (!userId) {
      console.error("user ID is required.");
      return;
    }

    chrome.runtime.sendMessage({
      action: "fetchCategories", userId: userId
    },
      function (response) {
        if (response.status === "success") {
          console.log("Categories retrieved successfully", response.data);
          setCategories(response.data || []);
        } else {
          console.error("Failed to fetch categories:", response.message);
        }
      }
    )
  };

  const addCategory = (name, userId) => {
    if (!name || !userId) {
      console.error("Category name and user ID are required.");
      return;
    }

    chrome.runtime.sendMessage(
      { action: "addCategory", categoryName: name, userId: userId },
      function (response) {
        if (chrome.runtime.lastError) {
          console.error("Error contacting the background script:", chrome.runtime.lastError);
          return;
        }

        if (response && response.status === "success") {
          console.log("Category added successfully");
          console.log(response.data.data.category);
          setCategories(response.data.data.category);
          setNewCategoryName(""); // Clear the input field
          setShowAddCategory(false); // Close the modal
        } else {
          console.error("Failed to add category. Response:", response);
        }
      }
    );
  };

  const updateCategory = (userId, newName, categoryId) => {
    if (!newName || !categoryId || !userId) {
      console.error("Category name and user ID are required.");
      return;
    }

    chrome.runtime.sendMessage({
      action: "updateCategory", userId: userId, categoryName: newName, categoryId: categoryId
    },
      function (response) {
        if (chrome.runtime.lastError) {
          console.error("Error contacting the background script:", chrome.runtime.lastError);
          return;
        }

        if (response && response.status === "success") {
          console.log("Category updated successfully");
          setCategories(prevCategories =>
            prevCategories.map(cat =>
              cat._id === categoryId ? { ...cat, name: newName } : cat
            )
          );

          setShowUpdateCategory(false);
        } else {
          console.error("Failed to add category. Response:", response);
        }
      }
    )
  }

  const fetchRepositories = (token) => {
    chrome.runtime.sendMessage(
      { action: "fetchRepositories", access_token: token },
      function (response) {
        if (response.status === "success") {
          console.log("Repositories retrieved successfully", response.repositories);
          setRepositories(response.repositories);
        } else {
          console.error("Failed to fetch repositories:", response.message);
        }
      }
    );
  };


  const deleteCategory = (userId, categoryId) => {
    if (!categoryId || !userId) {
      console.error("Category Id and user ID are required.");
      return;
    };

    chrome.runtime.sendMessage({
      action: "deleteCategory", userId: userId, categoryId: categoryId
    },
      function (response) {
        if (response.status === "success") {
          console.log("Category deleted successfully", response.data);
          setCategories(response.data.data.category);
          setShowDeleteCategory(false);
        } else {
          console.error("Failed to delete category:", response.message);
        }
      }
    )

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

  const openRepoSelectionDialog = (category) => {
    setCurrentCategory(category); // Save the current category
    setIsDialogOpen(true); // Open the dialog
  };

  const openDeleteRepoDialog = (category, repo) => {

    setCurrentCategory(category);
    setCurrentRepositoryID({ _id: repo._id});
    setIsDeleteRepoOpen(true);
  };

  const handleUpdateRepository = (userId, categoryId, action, repos) => {
    if (!userId || !categoryId || !action || !repos) {
      console.error("Category Id, user ID, action and repos are required.");
      return;
    };
    console.log(repos);


    chrome.runtime.sendMessage({
      action: "updateRepository", userId: userInfo.id, categoryId: categoryId, repoAction: action, repository: repos
    },
      function (response) {
        if (response.status === "success") {
          console.log("Repository updated successfully", response.data);
          setCategories(response.data.data.category);
          setSelectedRepos([]);
          setIsDialogOpen(false);
          setIsDeleteRepoOpen(false);
        } else {
          console.error("Failed to delete category:", response.message);
        }
      }
    )

  };


  const openUpdateCategoryDialog = (category) => {
    setCurrentCategory(category);
    setUpdatedCategoryName(category.name);
    setShowUpdateCategory(true);
  };

  const openDeleteCategoryDialog = (category) => {
    setCurrentCategory(category);
    setShowDeleteCategory(true);
  };

  const handleCheckboxChange = (repo) => {
    setSelectedRepos((prev) => {
      const exists = prev.some((r) => r.repoName === repo.repoName);
      return exists
        ? prev.filter((r) => r.repoName !== repo.repoName)
        : [...prev, repo];
    });
  };

  useEffect(() => {
    checkExistingToken();
  }, []);



  return (
    <div className="App min-h-screen flex items-center justify-center bg-gray-100 p-2">
      <div className="w-full max-w-xl bg-white shadow-lg overflow-hidden flex flex-col h-[600px]">
        <div className="bg-[#24292e] text-white py-3 px-4">
          <h1 className="text-xl font-bold flex items-center justify-center">
            <FiGithub className="mr-2 text-2xl" />
            GitHub Repository Manager
          </h1>
        </div>
        <div className="p-4 flex-grow overflow-y-auto text-sm">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-600 mb-4">Welcome! Please log in to manage your repositories.</p>
              <button
                onClick={() => handleLogin().catch((error) => console.error("Login error:", error.message))}
                className="w-full max-w-xs bg-[#2ea44f] hover:bg-[#2c974b] text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center"
              >
                <FiGithub className="mr-2" />
                Login with GitHub
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-md shadow-sm">
                <div className="text-gray-800">
                  {userInfo ? (
                    <div>
                      <p className="font-semibold">
                        Logged in as: <span className="text-[#0366d6]">{userInfo.login}</span>
                      </p>
                      <p className="text-gray-600 text-xs">{userInfo.email}</p>
                    </div>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-[#d73a49] hover:bg-[#cb2431] text-white font-semibold py-1 px-3 rounded-md flex items-center text-xs"
                >
                  <FiLogOut className="mr-1" />
                  Logout
                </button>
              </div>

              <button
                onClick={() => setShowAddCategory(true)}
                className="w-full bg-[#2ea44f] hover:bg-[#2c974b] text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center mb-4 text-sm"
              >
                <FiPlus className="mr-2" />
                Add Category
              </button>

              <div className="mb-4">
                <button
                  onClick={() => setShowRepositories(!showRepositories)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md flex items-center justify-between text-sm"
                >
                  <span>All Repositories</span>
                  {showRepositories ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>

              {showRepositories && (
                <div className="repo-list bg-gray-50 rounded-md p-3 mb-4 min-h-[200px] overflow-y-auto">
                  <div className="mb-2 flex items-center bg-white rounded-md w-50">
                    <FiSearch className="text-gray-400 ml-2" />
                    <input
                      type="text"
                      placeholder="Search repositories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 rounded-md focus:outline-none text-sm"
                    />
                  </div>
                  {filteredRepositories.length === 0 ? (
                    <p className="text-gray-500 text-center py-2">No repositories found</p>
                  ) : (
                    <ul className="space-y-2">
                      {filteredRepositories.map(([name, url]) => (
                        <li key={name} className="repo-item bg-white p-2 rounded-md shadow-sm hover:shadow-md transition duration-300">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="repo-link flex items-center justify-between text-[#0366d6] hover:underline"
                          >
                            <span>{name}</span>
                            <FiExternalLink className="text-gray-400" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="categories-container">
                <h2 className="text-lg font-bold mb-2 text-gray-800">Categories</h2>
                {categories && categories.map((category) => (
                  <div key={category._id} className="category-item mb-2">
                    <button
                      onClick={() => toggleCategory(category._id)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md flex items-center justify-between text-sm"
                    >
                      <span>{category.name}</span>
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent category toggle
                            openRepoSelectionDialog(category);
                          }}
                          className="mr-2 bg-white text-gray-700 hover:bg-gray-800 hover:text-white p-2 rounded-md shadow"
                        >
                          <FiPlus />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openUpdateCategoryDialog(category);
                          }}
                          className="mr-2 bg-white text-gray-700 hover:bg-gray-800 hover:text-white p-2 rounded-md shadow"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteCategoryDialog(category);
                          }}
                          className="mr-2 bg-white text-gray-700 hover:bg-gray-800 hover:text-white p-2 rounded-md shadow"
                        >
                          <FiTrash2 />
                        </button>
                        {expandedCategories[category._id] ? <FiChevronUp /> : <FiChevronDown />}
                      </div>
                    </button>
                    {expandedCategories[category._id] && (
                      <div className="category-repos bg-gray-50 rounded-lg p-3 mt-2 max-h-[200px] overflow-y-auto shadow-inner">
                        {category.repos.length > 0 ? (
                          <ul className="space-y-2">
                            {category.repos.map((repo) => (
                              <li
                                key={repo.repoName}
                                className="repo-item bg-white p-3 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 flex items-center justify-between"
                              >
                                <a
                                  href={repo.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="repo-link flex items-center text-[#0366d6] hover:underline"
                                >
                                  <span className="text-sm font-medium">{repo.repoName}</span>
                                  <FiExternalLink className="ml-2 text-gray-500 hover:text-gray-700 transition duration-150" />
                                </a>

                                {/* Remove button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteRepoDialog(category, repo);
                                  }}
                                  className="ml-4 bg-red-500 text-white hover:bg-red-600 p-2 rounded-lg shadow"
                                >
                                  <FiTrash2 />
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-center py-2">No repositories in this category.</p>
                        )}
                      </div>
                    )}

                  </div>
                ))}
              </div>

              {showAddCategory && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                  <div className="bg-white p-6 rounded-lg shadow-xl w-80">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Category</h2>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md mb-4 text-sm"
                      placeholder="Enter category name"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowAddCategory(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-1 px-3 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => addCategory(newCategoryName, userInfo.id)}
                        className="bg-[#2ea44f] hover:bg-[#2c974b] text-white font-semibold py-1 px-3 rounded-md text-sm"
                      >
                        Add Category
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showUpdateCategory && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                  <div className="bg-white p-6 rounded-lg shadow-xl w-80">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Update Category Name</h2>
                    <input
                      type="text"
                      value={updatedCategoryName}
                      onChange={(e) => setUpdatedCategoryName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md mb-4 text-sm"
                      placeholder="Enter new category name"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowUpdateCategory(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-1 px-3 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => 
                          updateCategory(userInfo.id, updatedCategoryName, currentCategory._id)}
                        className="bg-[#2ea44f] hover:bg-[#2c974b] text-white font-semibold py-1 px-3 rounded-md text-sm"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showDeleteCategory && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                  <div className="bg-white p-6 rounded-lg shadow-xl w-80">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Delete Category</h2>
                    <p className="text-gray-600 mb-4 text-sm">Are you sure you want to delete this category? This action cannot be undone.</p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowDeleteCategory(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-1 px-3 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteCategory(userInfo.id, currentCategory._id)}
                        className="bg-[#d73a49] hover:bg-[#cb2431] text-white font-semibold py-1 px-3 rounded-md text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {
                isDeleteRepoOpen && (
                  <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-80">
                      <h2 className="text-xl font-bold mb-4 text-gray-800">Delete Repository</h2>
                      <p className="text-gray-600 mb-4 text-sm">Are you sure you want to delete this repository? This action cannot be undone.</p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setIsDeleteRepoOpen(false)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-1 px-3 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            console.log("currentRepositoryID: ", currentRepositoryID);
                            handleUpdateRepository(userInfo.id, currentCategory._id, "remove", currentRepositoryID);
                          }}
                          className="bg-[#d73a49] hover:bg-[#cb2431] text-white font-semibold py-1 px-3 rounded-md text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }


              {isDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-lg w-80 max-h-full h-96 flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
                      Select Repositories
                    </h2>

                    {/* Search Input */}
                    <div className="mb-4 flex items-center bg-white rounded-md w-50">
                      <FiSearch className="text-gray-400 ml-2" />
                      <input
                        type="text"
                        placeholder="Search repositories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 rounded-md focus:outline-none text-sm"
                      />
                    </div>

                    {/* Scrollable repository list */}
                    <div className="flex-grow overflow-y-auto space-y-3">
                      {Object.entries(repositories)
                        .filter(([name]) =>
                          name.toLowerCase().includes(searchQuery.toLowerCase())
                        ) // Filter repos based on search query
                        .map(([name, url]) => {
                          const fixedRepos = currentCategory.repos.map((repo) => repo.repoName) || [];
                          const isFixed = fixedRepos.includes(name);

                          // Check if the repo is selected
                          const isChecked = selectedRepos.some((repo) => repo.repoName === name);

                          return (
                            <div key={name} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  onChange={() => handleCheckboxChange({ repoName: name, link: url })}
                                  checked={isChecked}
                                  className="form-checkbox h-4 w-4 text-blue-500"
                                  disabled={isFixed}
                                />
                                <span
                                  className={`ml-3 text-sm break-words ${isFixed ? 'text-gray-500 italic' : 'text-gray-700'}`}
                                  style={{ maxWidth: '160px' }}
                                >
                                  {name} {isFixed && '(Fixed)'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Fixed Save and Cancel buttons */}
                    <div className="mt-4 flex justify-between pt-4 border-t border-gray-200">
                      <button
                        className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-lg transition ease-in-out duration-200"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition ease-in-out duration-200"
                        onClick={() =>
                          handleUpdateRepository(userInfo.id, currentCategory._id, "add", selectedRepos)
                        }
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
        <footer className="bg-gray-100 text-center py-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} GitHub Repository Manager</p>
        </footer>
      </div>

    </div>
  );
}

export default App;
