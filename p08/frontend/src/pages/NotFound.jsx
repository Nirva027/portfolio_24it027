import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="route-page not-found" aria-labelledby="not-found-title">
      <p className="eyebrow">404 · PAGE NOT FOUND</p>
      <h1 id="not-found-title">
        Lost in <span>space.</span>
      </h1>
      <p className="page-intro">That page isn’t here, but the home page is.</p>
      <Link className="text-link" to="/">
        Back to home <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}

export default NotFound;
