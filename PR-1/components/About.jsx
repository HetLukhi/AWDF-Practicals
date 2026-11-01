import React from "react";

function About() {
  return (
    <section className="card">
      <h2>About Me</h2>

      <p>
        I am a passionate Computer Science student with an interest in web
        development, programming, and problem solving. I enjoy learning
        modern technologies and building responsive web applications.
      </p>

      <h2>Academic Information</h2>

      <table>
        <tbody>
          <tr>
            <td><strong>College:</strong></td>
            <td>CSPIT College</td>
          </tr>

          <tr>
            <td><strong>Degree:</strong></td>
            <td>Bachelor of Computer Science</td>
          </tr>

          <tr>
            <td><strong>Year:</strong></td>
            <td>3rd Year</td>
          </tr>

          <tr>
            <td><strong>Email:</strong></td>
            <td>24it043@charust.edu.in</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export default About;