import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Task Glitch</h1>
          <p>استخدام افراد برای انجام کارهای روزمره</p>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>خوش آمدید</h2>
      <p>سریعا برنامه را آماده خواهیم کرد!</p>
    </div>
  );
}

export default App;
