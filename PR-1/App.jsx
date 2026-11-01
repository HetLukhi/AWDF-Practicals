import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Footer from "./components/Footer";
import React from "react";
import "./App.css";

function App() {
  const studentName = "Het Lukhi";

  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Python",
    "Git"
  ];

  return (
    <div className="container">
      <Header name={studentName} />

      <About />

      <Skills
        title="Technical Skills"
        skills={skills}
      />

      <Footer name={studentName} />
    </div>
  );
}

export default App;