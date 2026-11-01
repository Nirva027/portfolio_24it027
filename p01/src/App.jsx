import About from './components/About.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import Skills from './components/Skills.jsx';

const skills = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'C++',
  'Python',
  'Git',
];

function App() {
  return (
    <div className="portfolio-shell">
      <Header name="Nirva Hadvani" role="IT Student & Web Developer" />

      <main className="portfolio-content">
        <About
          name="Nirva"
          university="CHARUSAT University"
          program="B.Tech in Information Technology"
        />
        <Skills items={skills} />
      </main>

      <Footer email="nirva.hadvani@example.com" />
    </div>
  );
}

export default App;
