import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Tab-title cue so a local dev tab is never mistaken for the prod tab sitting next to it.
if (process.env.NODE_ENV === 'development') {
  document.title = `DEV - ${document.title}`;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <App />
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
