import React, { useState, useEffect } from 'react';
import Menu from '../Menu/Menu.js';
import { useUserStore } from '../../stores/userStore.js';
import { signOut } from '../../services/auth.js';
import './DiscountForm.css';
import { bulkPostEdit, postAdminMessage, getSiteMessage } from '../../services/fetch-utils.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DiscountForm() {
  const [percentage, setPercentage] = useState('');
  const [message, setMessage] = useState('');
  const { signout } = useUserStore();
  const [action, setAction] = useState('apply');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const currentMessage = await getSiteMessage();
        setMessage(currentMessage.message);
      } catch (error) {
        console.error('An error occurred while fetching the message:', error);
        toast.error('An error occurred while fetching the message', {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'discount-form-1',
          autoClose: true,
        });
      }
    };

    fetchMessage();
  }, []);

  const handleClick = async () => {
    await signOut();
    signout();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (action === 'apply' && percentage) {
        await bulkPostEdit(action, percentage);
      } else if (action === 'undo') {
        await bulkPostEdit(action);
      }

      if (message) {
        await postAdminMessage(message);
      }

      navigate('/admin');
    } catch (error) {
      console.error('An error occurred:', error);
      toast.error('An error occurred , edit sales message failed', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'discount-form-2',
        autoClose: true,
      });
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
        <h2 className="form-title">
          {action === 'apply' ? 'Enter Discount Percentage' : 'Undo Discount'}
        </h2>
        <section className="form-section">
          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            placeholder="%"
            max="99"
            min="0"
            className="input-field percentage-input"
            disabled={action === 'undo'}
          />
        </section>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              value="apply"
              checked={action === 'apply'}
              onChange={() => setAction('apply')}
            />
            Apply Discount to ALL posts
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="undo"
              checked={action === 'undo'}
              onChange={() => setAction('undo')}
            />
            Undo ALL Discounts
          </label>
        </div>

        <section className="form-section2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter a message for your customers"
            rows="8"
            className="input-field message-input"
          />
        </section>
        <div>
          <button className="submit-btn" type="submit">
            <img src="/upload.png" alt="upload" />
          </button>
        </div>
      </form>
    </div>
  );
}
