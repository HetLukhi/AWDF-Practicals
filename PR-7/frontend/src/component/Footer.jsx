function Footer({ student }) {
  return (
    <footer className="footer">
      <h2>Contact Information</h2>
      <p><strong>Email:</strong> {student.email}</p>
      <p><strong>Phone:</strong> {student.phone}</p>
      <p><strong>GitHub:</strong> {student.github}</p>
      <p><strong>LinkedIn:</strong> {student.linkedin}</p>
      <hr />
      <p>© 2026 {student.name}. All Rights Reserved.</p>
    </footer>
  );
}

export default Footer;
