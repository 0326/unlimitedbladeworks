import { Link } from "react-router";

export default function HomePage() {
  return (
    <main className="home">
      <p className="home__eyebrow">A digital archive of legendary blades</p>
      <h1 className="home__title">
        UNLIMITED
        <br />
        BLADE
      </h1>
      <p className="home__hint">
        History, myth, and craft — kept sharp in one archive. The cinematic field arrives with Phase
        1; the record viewer is already reachable.
      </p>
      <nav className="home__actions" aria-label="Primary">
        <Link to="/lab/blade-field">Enter the Field</Link>
        <Link to="/blades/calibration-katana">Open a record</Link>
      </nav>
    </main>
  );
}
