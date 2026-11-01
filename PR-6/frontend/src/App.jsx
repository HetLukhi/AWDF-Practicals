import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './component/Navbar';
import Home from './pages/home';
import Projects from './pages/projects';
import Contact from './pages/contact';
import Footer from './component/Footer';
import './App.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const student = {
    name: 'Manav Kansagara',
    title: 'Computer Science Engineering Student',
    college: 'CHARUSAT University',
    semester: 'Semester 5',
    city: 'Nadiad, Gujarat',
    email: 'manav@gmail.com',
    phone: '+91 ----------',
    github: 'github.com/KansagaraManav2006',
    linkedin: 'linkedin.com/in/manav',
    objective:
      'Passionate Computer Engineering student with strong interest in Web Development, Full Stack Development, React, Node.js, and MongoDB. Seeking opportunities to build real-world software solutions.'
  };

  const skills = [
    'HTML5',
    'CSS3',
    'JavaScript',
    'React JS',
    'Node.js',
    'Express.js',
    'MongoDB',
    'Mongoose',
    'REST APIs',
    'Git',
    'GitHub'
  ];

  return (
    <div className="container">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home student={student} skills={skills} />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer student={student} />
    </div>
  );
}

export default App;
