function About({ student }) {
  return (
    <section className="card">
      <h2>Career Objective</h2>
      <p>{student.objective}</p>
      <hr />
      <h2>Academic Information</h2>
      <table>
        <tbody>
          <tr>
            <td><b>Name</b></td>
            <td>{student.name}</td>
          </tr>
          <tr>
            <td><b>Course</b></td>
            <td>B.Tech. Computer Science Engineering</td>
          </tr>
          <tr>
            <td><b>Semester</b></td>
            <td>{student.semester}</td>
          </tr>
          <tr>
            <td><b>College</b></td>
            <td>{student.college}</td>
          </tr>
          <tr>
            <td><b>City</b></td>
            <td>{student.city}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export default About;
