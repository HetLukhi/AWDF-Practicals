function Skills({ title, skills }) {
  return (
    <section className="card">
      <h2>{title}</h2>

      <ul>
        {skills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>
    </section>
  );
}

export default Skills;