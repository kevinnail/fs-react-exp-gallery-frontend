import React, { useState } from 'react';
import Menu from '../Menu/Menu.js';
import { useUser } from '../../hooks/useUser.js';
import { signOut } from '../../services/auth.js';
import './DiscountForm.css';
import { bulkPostEdit } from '../../services/fetch-utils.js';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min.js';

export default function DiscountForm() {
  const [percentage, setPercentage] = useState('');
  const { setUser } = useUser();
  const [action, setAction] = useState('apply');
  const history = useHistory();
  const handleClick = async () => {
    await signOut();
    setUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // apply discount /undo all discounts
      await bulkPostEdit(action, percentage);
      history.push('/admin');
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className="form-wrapper">
      <aside className="form-admin-panel">
        <section className="form-admin-panel-section">
          <div>
            <Menu handleClick={handleClick} />
          </div>
        </section>
      </aside>
      <form className="discount-form" onSubmit={handleSubmit}>
        <h2>{action === 'apply' ? 'Enter Discount Percentage' : 'Undo Discount'}</h2>
        <section>
          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            placeholder="%"
            max="99"
            min="0"
            width="300px"
            className="discount-input"
            maxLength={2}
            disabled={action === 'undo'}
          />
          <div>
            <label>
              <input
                type="radio"
                value="apply"
                checked={action === 'apply'}
                onChange={() => setAction('apply')}
              />
              Apply Discount
            </label>
            <label>
              <input
                type="radio"
                value="undo"
                checked={action === 'undo'}
                onChange={() => setAction('undo')}
              />
              Undo Discount
            </label>
          </div>
        </section>
        <button className="discount-submit-btn" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}
