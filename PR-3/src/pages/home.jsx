import Header from '../component/Header'
import About from '../component/About'
import Skills from '../component/Skills'

function Home({ student, skills }) {
  return (
    <>
      <Header student={student} />
      <About student={student} />
      <Skills skills={skills} />
    </>
  )
}

export default Home