import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import NavBar from './components/NavBar.jsx';
import Contact from './pages/Contact.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import Tasks from './pages/Tasks.jsx';

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
    <BrowserRouter>
      <div className="portfolio-shell">
        <Header name="Nirva Hadvani" role="IT Student & Web Developer" />
        <NavBar />

        <main className="route-content">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  name="Nirva"
                  university="CHARUSAT University"
                  program="B.Tech in Information Technology"
                  skills={skills}
                />
              }
            />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer email="nirva.hadvani@example.com" />
      </div>
    </BrowserRouter>
  );
}

export default App;
