import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Truck, Menu, X, Phone } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const location = useLocation();
  const isHome = location.pathname === "/";
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const headerBg = isHome && !isScrolled
    ? "bg-transparent"
    : "bg-primary/95 backdrop-blur-md shadow-lg";

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <Truck className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold text-primary-foreground">
                ExpressLivraison
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                to="/"
                className="text-primary-foreground/80 hover:text-primary-foreground font-medium transition-colors"
              >
                Accueil
              </Link>
              <Link
                to="/demande"
                className="text-primary-foreground/80 hover:text-primary-foreground font-medium transition-colors"
              >
                Demander une livraison
              </Link>
              <Link
                to="/a-propos"
                className="text-primary-foreground/80 hover:text-primary-foreground font-medium transition-colors"
              >
                À propos
              </Link>
              <Link
                to="/contact"
                className="text-primary-foreground/80 hover:text-primary-foreground font-medium transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <Link to="/admin">
                <Button variant="heroOutline" size="sm">
                  Espace Pro
                </Button>
              </Link>
              <Link to="/demande">
                <Button variant="hero" size="lg">
                  Demander une livraison
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-primary-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden bg-primary border-t border-primary-foreground/10 py-4 animate-fade-in">
              <nav className="flex flex-col gap-4">
                <Link
                  to="/"
                  className="text-primary-foreground/80 hover:text-primary-foreground font-medium px-4 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accueil
                </Link>
                <Link
                  to="/demande"
                  className="text-primary-foreground/80 hover:text-primary-foreground font-medium px-4 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Demander une livraison
                </Link>
                <Link
                  to="/a-propos"
                  className="text-primary-foreground/80 hover:text-primary-foreground font-medium px-4 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  À propos
                </Link>
                <Link
                  to="/contact"
                  className="text-primary-foreground/80 hover:text-primary-foreground font-medium px-4 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <div className="flex flex-col gap-2 px-4 pt-4 border-t border-primary-foreground/10">
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="heroOutline" className="w-full">
                      Espace Pro
                    </Button>
                  </Link>
                  <Link to="/demande" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="hero" className="w-full">
                      Demander une livraison
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
