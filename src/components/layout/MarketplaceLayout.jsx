import { Link, NavLink } from "react-router-dom";
import { ListChecks } from "lucide-react";
import BrandLogo from "../common/BrandLogo";

export default function MarketplaceLayout({ children, hideTopbar = false, fullWidth = false, heroTopbar = false, hideFooter = false }) {
  return (
    <div className={heroTopbar ? "app-shell hero-topbar-shell" : "app-shell"}>
      {!hideTopbar ? (
        <header className={heroTopbar ? "topbar hero-topbar" : "topbar"}>
          <div className="topbar-inner">
            <Link to="/marketplace" className="brand-left" aria-label="BoraCuidar, página inicial">
              <BrandLogo />
            </Link>
            <nav className="topbar-actions" aria-label="Navegação principal">
              <NavLink className="about-btn topbar-rotina" to="/minha-rotina">
                <ListChecks size={16} aria-hidden="true" /> Minha rotina
              </NavLink>
              <Link className="about-btn topbar-link-schedules" to="/marketplace/meus-agendamentos">
                Meus agendamentos
              </Link>
              <a className="about-btn" href="https://business.boracuidar.app">
                Para negócios
              </a>
              <Link className="signup-btn signup-btn-hidden" to="/signup">Cadastrar</Link>
              <a className="signin-btn" href="https://boracuidar.app/signin">Entrar</a>
            </nav>
          </div>
        </header>
      ) : null}
      <main className={fullWidth ? "main-shell full" : "main-shell"}>{children}</main>
      {!hideFooter ? (
        <footer className="app-footer">
          <div className="app-footer-inner">
            <div className="app-footer-brand">
              <BrandLogo />
              <p>Onde a gente se cuida.</p>
            </div>
            <div className="app-footer-links">
              <Link to="/marketplace">Explorar</Link>
              <Link to="/minha-rotina">Minha rotina</Link>
              <Link to="/marketplace/meus-agendamentos">Meus agendamentos</Link>
              <a href="https://business.boracuidar.app">Para negócios</a>
            </div>
            <p className="app-footer-legal">© {new Date().getFullYear()} BoraCuidar</p>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
