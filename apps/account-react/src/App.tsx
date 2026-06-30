import { Link, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./state/RequireAuth";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { AccountHomePage } from "./pages/AccountHomePage";
import { DraftsPage } from "./pages/DraftsPage";

export default function App() {
  return (
    <div className="shell account-shell">
      <header className="account-header">
        <div>
          <div className="eyebrow">Account Shell</div>
          <h1 className="account-title">JWT-first auth flow on React.</h1>
        </div>
        <nav className="public-nav">
          <a href="http://localhost:5173">Public</a>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<AccountHomePage />} />
          <Route path="/drafts" element={<DraftsPage />} />
        </Route>
      </Routes>
    </div>
  );
}
