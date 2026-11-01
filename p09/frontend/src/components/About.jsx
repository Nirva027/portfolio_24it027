function About({ name, university, program }) {
  return (
    <section className="about-section" id="home" aria-labelledby="about-title">
      <p className="eyebrow">A LITTLE ABOUT ME</p>
      <h1 id="about-title">
        Curious mind.
        <br />
        <span>Thoughtful code.</span>
      </h1>
      <div className="about-copy">
        <p>
          Hi, I’m <strong>{name}</strong>, a student at {university}, pursuing{' '}
          {program}. I enjoy turning ideas into clear, accessible experiences
          for the web.
        </p>
        <p>
          I’m building my skills one project at a time, exploring frontend
          development, thoughtful design, and the technology behind useful
          products.
        </p>
      </div>
      <a className="text-link" href="#skills">
        Explore my skills <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}

export default About;
