import React from 'react';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>Oops! The page you are looking for does not exist.</p>
      <a href="/">Go back home</a>
    </div>
  );
}

export default NotFoundPage;