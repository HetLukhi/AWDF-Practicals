import { useState } from 'react';

function Skills({ skills }) {
  const [showSkills, setShowSkills] = useState(true);

  return (
    <section className="card">
      <h2>Technical Skills</h2>
      <button
        type="button"
        className="secondary-button skills-toggle-btn"
        onClick={() => setShowSkills(!showSkills)}
      >
        {showSkills ? 'Hide Skills' : 'Show Skills'}
      </button>

      {showSkills && (
        <div className="skills">
          {skills.map((skill) => (
            <div key={skill} className="skill-card">
              {skill}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Skills;
