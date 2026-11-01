import React from "react";

function Projects() {
  const projects = [
    "Student Portfolio Website",
    "Expense Tracker",
    "Weather App",
    "Library Management System"
  ];

  return (
    <section className="card">
      <h2>Projects</h2>

      <ul>
        {projects.map((project, index) => (
          <li key={index}>{project}</li>
        ))}
      </ul>
    </section>
  );
}

export default Projects;