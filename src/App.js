import React, { useState, useEffect } from 'react';

function App() {
  const [htmlSource, setHtmlSource] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [showSelectedGames, setShowSelectedGames] = useState(false);
  const [selectionHistory, setSelectionHistory] = useState([]);

  // Common ROM regions and their patterns
  const regionFilters = [
    { id: 'usa', name: 'USA', pattern: /\(USA\)|\(US\)|\(United States\)/i },
    { id: 'eur', name: 'Europe', pattern: /\(Europe\)|\(EU\)|\(PAL\)/i },
    { id: 'jpn', name: 'Japan', pattern: /\(Japan\)|\(JP\)/i },
    { id: 'ger', name: 'Germany', pattern: /\(Germany\)|\(DE\)|\(Ger\)/i },
    { id: 'fra', name: 'France', pattern: /\(France\)|\(FR\)|\(Fr\)/i },
    { id: 'spa', name: 'Spain', pattern: /\(Spain\)|\(ES\)|\(Sp\)/i },
    { id: 'ita', name: 'Italy', pattern: /\(Italy\)|\(IT\)|\(It\)/i },
    { id: 'uk', name: 'UK', pattern: /\(UK\)|\(United Kingdom\)/i },
    { id: 'can', name: 'Canada', pattern: /\(Canada\)|\(CA\)|\(Can\)/i },
    { id: 'aus', name: 'Australia', pattern: /\(Australia\)|\(AU\)|\(Aus\)/i },
    { id: 'kor', name: 'Korea', pattern: /\(Korea\)|\(KR\)|\(Kor\)/i },
    { id: 'chn', name: 'China', pattern: /\(China\)|\(CN\)|\(Chn\)/i },
    { id: 'rus', name: 'Russia', pattern: /\(Russia\)|\(RU\)|\(Rus\)/i },
    { id: 'bra', name: 'Brazil', pattern: /\(Brazil\)|\(BR\)|\(Bra\)/i },
    { id: 'multi', name: 'Multi-Language', pattern: /\(Multi\)|\(Multi-Lang\)|\(MULTI\)/i },
    { id: 'world', name: 'World', pattern: /\(World\)|\(WORLD\)/i }
  ];

  // File type filters
  const fileTypeFilters = [
    { id: 'zip', name: '.zip', pattern: /\.zip$/i },
    { id: 'rar', name: '.rar', pattern: /\.rar$/i },
    { id: '7z', name: '.7z', pattern: /\.7z$/i },
    { id: 'iso', name: '.iso', pattern: /\.iso$/i },
    { id: 'bin', name: '.bin', pattern: /\.bin$/i },
    { id: 'gba', name: '.gba', pattern: /\.gba$/i },
    { id: 'nds', name: '.nds', pattern: /\.nds$/i },
    { id: '3ds', name: '.3ds', pattern: /\.3ds$/i }
  ];

  // Exclusion filters (to hide unwanted content)
  const exclusionFilters = [
    { id: 'no-demo', name: 'Hide Demos', pattern: /\(Demo\)|\(Kiosk\)|\(Sample\)/i },
    { id: 'no-vc', name: 'Hide Virtual Console', pattern: /\(Virtual Console\)|\(VC\)/i },
    { id: 'no-wiiu', name: 'Hide Wii U', pattern: /\(Wii U\)|\(WiiU\)/i },
    { id: 'no-beta', name: 'Hide Betas', pattern: /\(Beta\)|\(Prototype\)/i },
    { id: 'no-hack', name: 'Hide Hacks', pattern: /\(Hack\)|\(Modified\)/i },
    { id: 'no-translation', name: 'Hide Translations', pattern: /\(Translation\)|\(Translated\)/i }
  ];

  // Load saved selections from localStorage
  useEffect(() => {
    const savedSelections = localStorage.getItem('jdownloader-selected-games');
    if (savedSelections) {
      try {
        setSelectedLinks(JSON.parse(savedSelections));
      } catch (e) {
        console.error('Error parsing saved selections:', e);
      }
    }
  }, []);

  // Save selections to localStorage whenever they change
  useEffect(() => {
    if (selectedLinks.length > 0) {
      localStorage.setItem('jdownloader-selected-games', JSON.stringify(selectedLinks));
    } else {
      localStorage.removeItem('jdownloader-selected-games');
    }
  }, [selectedLinks]);

  // Filter links based on search term and active filters
  useEffect(() => {
    let filtered = [...links];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(link => 
        link.title.toLowerCase().includes(searchLower) ||
        link.href.toLowerCase().includes(searchLower) ||
        (link.region && link.region.toLowerCase().includes(searchLower))
      );
    }

    // Apply exclusion filters (hide unwanted content)
    const activeExclusions = activeFilters.filter(filterId => 
      exclusionFilters.some(exclusion => exclusion.id === filterId)
    );

    if (activeExclusions.length > 0) {
      filtered = filtered.filter(link => {
        return !activeExclusions.some(exclusionId => {
          const exclusion = exclusionFilters.find(f => f.id === exclusionId);
          return exclusion && exclusion.pattern.test(link.title);
        });
      });
    }

    // Apply inclusion filters (show only specific content)
    const activeInclusions = activeFilters.filter(filterId => 
      !exclusionFilters.some(exclusion => exclusion.id === filterId)
    );

    if (activeInclusions.length > 0) {
      filtered = filtered.filter(link => {
        return activeInclusions.some(filterId => {
          const filter = regionFilters.find(f => f.id === filterId) || 
                        fileTypeFilters.find(f => f.id === filterId);
          return filter && filter.pattern.test(link.title);
        });
      });
    }

    setFilteredLinks(filtered);
  }, [links, searchTerm, activeFilters, regionFilters, fileTypeFilters, exclusionFilters]);

  const extractRegionFromTitle = (title) => {
    for (const region of regionFilters) {
      if (region.pattern.test(title)) {
        return region.name;
      }
    }
    return null;
  };

  const constructFullUrl = (href) => {
    if (!baseUrl.trim()) {
      return href; // Return original href if no base URL provided
    }

    try {
      // If href is already a full URL, return it as is
      if (href.startsWith('http://') || href.startsWith('https://')) {
        return href;
      }

      // Remove trailing slash from base URL if present
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      
      // If href starts with /, it's an absolute path
      if (href.startsWith('/')) {
        return `${cleanBaseUrl}${href}`;
      }
      
      // Otherwise, it's a relative path
      return `${cleanBaseUrl}/${href}`;
    } catch (error) {
      console.error('Error constructing full URL:', error);
      return href; // Return original href if there's an error
    }
  };

  const parseHtml = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Focus on table rows only, not all links
    const tableRows = doc.querySelectorAll('table tr, #list tr, .list tr');
    const extractedLinks = [];

    tableRows.forEach((row) => {
      // Find links within table rows only
      const linkElement = row.querySelector('a[href]');
      if (!linkElement) return;

      const href = linkElement.getAttribute('href');
      const title = linkElement.getAttribute('title') || linkElement.textContent.trim();
      const text = linkElement.textContent.trim();
      
      // Skip empty links, navigation links, and parent directory
      if (!href || href === '#' || href.startsWith('javascript:') || 
          href.startsWith('mailto:') || text.includes('Parent directory') ||
          href === '../' || href === '../') {
        return;
      }

      // Get additional info from the same row
      const cells = row.querySelectorAll('td');
      let size = '';
      let date = '';

      if (cells.length >= 2) {
        const sizeCell = cells[1];
        if (sizeCell && !sizeCell.textContent.includes('-')) {
          size = sizeCell.textContent.trim();
        }
      }

      if (cells.length >= 3) {
        const dateCell = cells[2];
        if (dateCell && !dateCell.textContent.includes('-')) {
          date = dateCell.textContent.trim();
        }
      }

      // Extract region from title
      const region = extractRegionFromTitle(title);

      // Construct full URL
      const fullUrl = constructFullUrl(href);

      extractedLinks.push({
        id: Math.random().toString(36).substr(2, 9),
        href: href, // Keep original href for display
        fullUrl: fullUrl, // Store full URL for export
        title: title || text,
        text: text,
        size: size,
        date: date,
        region: region,
        selected: false
      });
    });

    return extractedLinks;
  };

  const handleParseHtml = () => {
    if (!htmlSource.trim()) {
      setError('Please enter HTML source code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const extractedLinks = parseHtml(htmlSource);
      setLinks(extractedLinks);
      setSelectedLinks([]);
      setSuccess(`Successfully parsed ${extractedLinks.length} links`);
    } catch (err) {
      setError('Error parsing HTML: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkToggle = (linkId) => {
    setSelectedLinks(prev => {
      const newSelection = prev.includes(linkId) 
        ? prev.filter(id => id !== linkId)
        : [...prev, linkId];
      
      // Track the change for undo functionality
      setSelectionHistory(history => [...history, {
        action: prev.includes(linkId) ? 'deselect' : 'select',
        linkId: linkId,
        previousSelection: [...prev]
      }]);
      
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    const newSelection = [...selectedLinks];
    const visibleLinkIds = filteredLinks.map(link => link.id);
    
    // Add only the visible links that aren't already selected
    visibleLinkIds.forEach(linkId => {
      if (!newSelection.includes(linkId)) {
        newSelection.push(linkId);
      }
    });
    
    setSelectionHistory(history => [...history, {
      action: 'select_all_visible',
      previousSelection: [...selectedLinks]
    }]);
    setSelectedLinks(newSelection);
  };

  const handleSelectAllReplace = () => {
    const newSelection = filteredLinks.map(link => link.id);
    setSelectionHistory(history => [...history, {
      action: 'select_all_visible_replace',
      previousSelection: [...selectedLinks]
    }]);
    setSelectedLinks(newSelection);
  };

  const handleDeselectAll = () => {
    setSelectionHistory(history => [...history, {
      action: 'deselect_all',
      previousSelection: [...selectedLinks]
    }]);
    setSelectedLinks([]);
  };

  const handleUndoLastSelected = () => {
    if (selectionHistory.length === 0) {
      setError('No actions to undo');
      return;
    }

    const lastAction = selectionHistory[selectionHistory.length - 1];
    setSelectedLinks(lastAction.previousSelection);
    setSelectionHistory(history => history.slice(0, -1));
    setSuccess('Undid last selection action');
  };

  const handleFilterToggle = (filterId) => {
    setActiveFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(id => id !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchTerm('');
  };

  const clearData = () => {
    setHtmlSource('');
    setBaseUrl('');
    setLinks([]);
    setFilteredLinks([]);
    setSelectedLinks([]);
    setSearchTerm('');
    setActiveFilters([]);
    setSelectionHistory([]);
    setError('');
    setSuccess('');
  };

  const generateJDownloaderText = () => {
    const selectedLinkObjects = links.filter(link => selectedLinks.includes(link.id));
    const urls = selectedLinkObjects.map(link => link.fullUrl);
    return urls.join('\n');
  };

  const handleExportToJDownloader = () => {
    if (selectedLinks.length === 0) {
      setError('Please select at least one link to export');
      return;
    }

    const text = generateJDownloaderText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jdownloader-links.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSuccess(`Exported ${selectedLinks.length} links to jdownloader-links.txt`);
  };

  const handleCopyToClipboard = () => {
    if (selectedLinks.length === 0) {
      setError('Please select at least one link to copy');
      return;
    }

    const text = generateJDownloaderText();
    navigator.clipboard.writeText(text).then(() => {
      setSuccess(`Copied ${selectedLinks.length} links to clipboard`);
    }).catch(() => {
      setError('Failed to copy to clipboard');
    });
  };

  const clearSelectedGames = () => {
    setSelectionHistory(history => [...history, {
      action: 'clear_all_selected',
      previousSelection: [...selectedLinks]
    }]);
    setSelectedLinks([]);
    setSuccess('Selected games list cleared');
  };

  const removeFromSelected = (linkId) => {
    setSelectedLinks(prev => {
      const newSelection = prev.filter(id => id !== linkId);
      setSelectionHistory(history => [...history, {
        action: 'remove_from_selected',
        linkId: linkId,
        previousSelection: [...prev]
      }]);
      return newSelection;
    });
  };

  const handleExportSelectedGames = () => {
    if (selectedGames.length === 0) {
      setError('No selected games to export');
      return;
    }

    const text = selectedGames.map(link => link.fullUrl).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected-games-links.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSuccess(`Exported ${selectedGames.length} selected games to selected-games-links.txt`);
  };

  const handleCopySelectedGames = () => {
    if (selectedGames.length === 0) {
      setError('No selected games to copy');
      return;
    }

    const text = selectedGames.map(link => link.fullUrl).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setSuccess(`Copied ${selectedGames.length} selected games to clipboard`);
    }).catch(() => {
      setError('Failed to copy selected games to clipboard');
    });
  };

  // Get selected games from all links (not just filtered)
  const selectedGames = links.filter(link => selectedLinks.includes(link.id));

  return (
    <div className="container">
      <div className="header">
        <h1>JDownloader Parser</h1>
        <p>Extract and manage download links from HTML page sources</p>
      </div>

      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="input-section">
          <div className="input-group">
            <label htmlFor="baseUrl">Base URL (for constructing full download links)</label>
            <input
              id="baseUrl"
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://myrient.erista.me/files/No-Intro/Nintendo%20-%20Nintendo%20DS%20%28Encrypted%29/"
            />
          </div>

          <div className="input-group">
            <label htmlFor="htmlSource">HTML Page Source</label>
            <textarea
              id="htmlSource"
              value={htmlSource}
              onChange={(e) => setHtmlSource(e.target.value)}
              placeholder="Paste the HTML source code here..."
            />
          </div>

          <div className="button-group">
            <button 
              className="btn btn-primary" 
              onClick={handleParseHtml}
              disabled={loading || !htmlSource.trim()}
            >
              {loading ? 'Parsing...' : 'Parse HTML'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={clearData}
            >
              Clear All Data
            </button>
          </div>
        </div>

        {/* Selected Games Section */}
        {selectedGames.length > 0 && (
          <div className="selected-games-section">
            <div className="selected-games-header">
              <h3>Selected Games ({selectedGames.length})</h3>
              <div className="selected-games-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowSelectedGames(!showSelectedGames)}
                >
                  {showSelectedGames ? 'Hide' : 'Show'} Selected Games
                </button>
                <button 
                  className="btn btn-success"
                  onClick={handleExportSelectedGames}
                >
                  Download Selected
                </button>
                <button 
                  className="btn btn-success"
                  onClick={handleCopySelectedGames}
                >
                  Copy Selected
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleUndoLastSelected}
                  disabled={selectionHistory.length === 0}
                >
                  Undo Last
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={clearSelectedGames}
                >
                  Clear All Selected
                </button>
              </div>
            </div>

            {showSelectedGames && (
              <div className="selected-games-container">
                {selectedGames.map((link) => (
                  <div key={link.id} className="selected-game-item">
                    <div className="selected-game-info">
                      <div className="selected-game-title">{link.title}</div>
                      <div className="selected-game-url">{link.href}</div>
                      {link.fullUrl !== link.href && (
                        <div className="selected-game-full-url">Full URL: {link.fullUrl}</div>
                      )}
                      {link.size && <div className="selected-game-size">Size: {link.size}</div>}
                      {link.date && <div className="selected-game-date">Date: {link.date}</div>}
                      {link.region && <div className="selected-game-region">Region: {link.region}</div>}
                    </div>
                    <button 
                      className="btn btn-secondary remove-btn"
                      onClick={() => removeFromSelected(link.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {links.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h3>Extracted Links</h3>
              <div className="results-stats">
                {selectedLinks.length} of {links.length} total selected (showing {filteredLinks.length} filtered)
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="search-filter-section">
              <h4>Search & Filters</h4>
              
              <input
                type="text"
                className="search-input"
                placeholder="Search by title, URL, or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="button-group" style={{ marginBottom: '15px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleSelectAll}
                >
                  Select All Visible (Add)
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleSelectAllReplace}
                >
                  Select All Visible (Replace)
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleDeselectAll}
                >
                  Deselect All
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleUndoLastSelected}
                  disabled={selectionHistory.length === 0}
                >
                  Undo Last Selected
                </button>
              </div>

              <h4>Hide Unwanted Content</h4>
              <div className="filter-grid">
                {exclusionFilters.map((filter) => (
                  <button
                    key={filter.id}
                    className={`filter-btn ${activeFilters.includes(filter.id) ? 'active' : ''}`}
                    onClick={() => handleFilterToggle(filter.id)}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>

              <h4>Region Filters</h4>
              <div className="filter-grid">
                {regionFilters.map((filter) => (
                  <button
                    key={filter.id}
                    className={`filter-btn ${activeFilters.includes(filter.id) ? 'active' : ''}`}
                    onClick={() => handleFilterToggle(filter.id)}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>

              <h4>File Type Filters</h4>
              <div className="filter-grid">
                {fileTypeFilters.map((filter) => (
                  <button
                    key={filter.id}
                    className={`filter-btn ${activeFilters.includes(filter.id) ? 'active' : ''}`}
                    onClick={() => handleFilterToggle(filter.id)}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="links-container">
              {filteredLinks.length > 0 ? (
                filteredLinks.map((link) => (
                  <div key={link.id} className="link-item">
                    <input
                      type="checkbox"
                      checked={selectedLinks.includes(link.id)}
                      onChange={() => handleLinkToggle(link.id)}
                    />
                    <div className="link-info">
                      <div className="link-title">{link.title}</div>
                      <div className="link-url">{link.href}</div>
                      {link.fullUrl !== link.href && (
                        <div className="link-full-url">Full URL: {link.fullUrl}</div>
                      )}
                      {link.size && <div className="link-size">Size: {link.size}</div>}
                      {link.date && <div className="link-date">Date: {link.date}</div>}
                      {link.region && <div className="link-region">Region: {link.region}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  {searchTerm || activeFilters.length > 0 
                    ? 'No links match your search/filter criteria' 
                    : 'No links found in the HTML source'
                  }
                </div>
              )}
            </div>

            <div className="button-group" style={{ marginTop: '20px' }}>
              <button 
                className="btn btn-success" 
                onClick={handleExportToJDownloader}
                disabled={selectedLinks.length === 0}
              >
                Export to JDownloader (.txt)
              </button>
              <button 
                className="btn btn-success" 
                onClick={handleCopyToClipboard}
                disabled={selectedLinks.length === 0}
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        )}

        {loading && <div className="loading">Processing...</div>}
      </div>
    </div>
  );
}

export default App; 