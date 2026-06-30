import { Link, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./state/RequireAuth";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

export default function App() {
  return (
    <div className="shell dashboard-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Mock Dashboard</div>
          <h1 className="title">Timeline-centered product simulation.</h1>
        </div>
        <nav className="public-nav">
          <a href="http://localhost:5173">Public</a>
          <a href="http://localhost:5174">Account</a>
          <a href="http://localhost:5175">Admin</a>
          <Link to="/">Dashboard</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>
      </Routes>
    </div>
  );
}
