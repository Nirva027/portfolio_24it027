import Header from "../components/Header";
import About from "../components/About";
import Skills from "../components/Skills";

function Home() {
  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "C++",
    "Python",
    "Git",
    "Vite"
  ];

  return (
    <div className="page-container animate-fade-in">
      <Header name="Nirva Hadvani" />
      
      <div className="home-content-layout" style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "32px" }}>
        <About
          university="CHARUSAT University"
          department="CSPIT"
          domain="B.Tech Information Technology (IT)"
        />
        <Skills skillList={skills} />
      </div>
    </div>
  );
}

export default Home;
