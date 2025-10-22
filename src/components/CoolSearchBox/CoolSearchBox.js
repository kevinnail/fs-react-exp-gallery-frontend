import { useState } from 'react';
import './CoolSearchBox.css';

const CoolSearchBox = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(searchValue);
  };

  return (
    <div className="cool-search-wrapper">
      <form className="cool-search-box" onSubmit={handleSubmit}>
        <input
          required
          type="search"
          className="cool-search-input"
          placeholder="Search..."
          autoComplete="off"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
        <button type="submit" className="cool-search-button">
          <span className="search-icon">🔍</span>
        </button>
      </form>
    </div>
  );
};

export default CoolSearchBox;
