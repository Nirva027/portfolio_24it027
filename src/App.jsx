import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Footer from "./components/Footer";

function App() {
  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "C++",
    "Python"
  ];

  return (
    <div>
      <Header name="Nirva Hadvani" />

      <About
        university="CHARUSAT University"
        department="CSPIT"
        domain="B.Tech Information Technology (IT)"
      />

      <Skills skillList={skills} />

      <Footer email="nirva.hadvani@example.com" />
    </div>
  );
}

export default App;