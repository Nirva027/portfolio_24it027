import About from '../components/About.jsx';
import Skills from '../components/Skills.jsx';

function Home({ name, university, program, skills }) {
  return (
    <div className="home-page">
      <About name={name} university={university} program={program} />
      <Skills items={skills} />
    </div>
  );
}

export default Home;
