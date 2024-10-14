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