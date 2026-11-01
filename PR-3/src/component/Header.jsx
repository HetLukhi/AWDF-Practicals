import React from "react";

function Header({ student }) {

  return (

    <header className="header">

      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKWX0mf7knAINX99LN7ZTaxjPW0bI6gDTBhUBL5IHrQg&s=10"
        alt="Profile"
        className="profile"
      />

      <h1>{student.name}</h1>

      <h2>{student.title}</h2>

      <p>{student.college}</p>

      <p>{student.city}</p>

    </header>

  );

}

export default Header;