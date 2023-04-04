import React from 'react';
import './CoolSearchBox.css';

const CoolSearchBox = ({ onSearch }) => {
  return (
    <form className="cool-search-box" onSubmit={onSearch}>
      <input
        type="search"
        className="cool-search-input"
        placeholder="Search..."
        autoComplete="off"
      />
      <button type="submit" className="cool-search-button">
        <i className="fa fa-search cool-search-icon"></i>
      </button>
    </form>
  );
};

export default CoolSearchBox;
