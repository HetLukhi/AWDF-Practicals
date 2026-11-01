function Skills({ skills }) {

  return (

    <section className="card">

      <h2>Technical Skills</h2>

      <div className="skills">

        {skills.map((skill,index)=>(

          <div
            key={index}
            className="skill-card"
          >
            {skill}
          </div>

        ))}

      </div>

    </section>

  );

}

export default Skills;