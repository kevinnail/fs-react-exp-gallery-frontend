import { useState } from 'react';
import './PostForm.css';

export default function PostForm({ task = '', submitHandler }) {
  const [taskInput, setTaskInput] = useState(task);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    submitHandler(taskInput);
  };

  return (
    <form className="new-post-form" onSubmit={handleFormSubmit}>
      <div>
        <label className="form-title">What is your task?</label>
        <br />
        <textarea
          required
          placeholder="Enter your task here"
          className="task-input"
          type="text"
          maxLength="80"
          name="task"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
      </div>
      <div>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
