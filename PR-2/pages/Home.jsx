import { useState } from "react";
import About from "../components/About";
import Skills from "../components/Skills";

function Home() {
  const [showSkills, setShowSkills] = useState(true);

  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Python",
    "Git"
  ];

  return (
    <>
      <About />

      <button
        className="toggle-btn"
        onClick={() => setShowSkills(!showSkills)}
      >
        {showSkills ? "Hide Skills" : "Show Skills"}
      </button>

      {showSkills && (
        <Skills
          title="Technical Skills"
          skills={skills}
        />
      )}
    </>
  );
}

export default Home;