import React, { useState, useEffect } from 'react';

function App() {
  const [htmlSource, setHtmlSource] = useState('');
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

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

    // Apply region filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(link => {
        return activeFilters.some(filterId => {
          const filter = regionFilters.find(f => f.id === filterId) || 
                        fileTypeFilters.find(f => f.id === filterId);
          return filter && filter.pattern.test(link.title);
        });
      });
    }

    setFilteredLinks(filtered);
  }, [links, searchTerm, activeFilters]);

  const extractRegionFromTitle = (title) => {
    for (const region of regionFilters) {
      if (region.pattern.test(title)) {
        return region.name;
      }
    }
    return null;
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

      extractedLinks.push({
        id: Math.random().toString(36).substr(2, 9),
        href: href,
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
      if (prev.includes(linkId)) {
        return prev.filter(id => id !== linkId);
      } else {
        return [...prev, linkId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedLinks(filteredLinks.map(link => link.id));
  };

  const handleDeselectAll = () => {
    setSelectedLinks([]);
  };

  const handleSelectByExtension = (extension) => {
    const matchingLinks = filteredLinks.filter(link => 
      link.href.toLowerCase().includes(extension.toLowerCase())
    );
    setSelectedLinks(matchingLinks.map(link => link.id));
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

  const generateJDownloaderText = () => {
    const selectedLinkObjects = filteredLinks.filter(link => selectedLinks.includes(link.id));
    const urls = selectedLinkObjects.map(link => link.href);
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

  const clearData = () => {
    setHtmlSource('');
    setLinks([]);
    setFilteredLinks([]);
    setSelectedLinks([]);
    setSearchTerm('');
    setActiveFilters([]);
    setError('');
    setSuccess('');
  };

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

        {links.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h3>Extracted Links</h3>
              <div className="results-stats">
                {selectedLinks.length} of {filteredLinks.length} selected (showing {filteredLinks.length} of {links.length} total)
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
                  Select All Visible
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleDeselectAll}
                >
                  Deselect All
                </button>
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