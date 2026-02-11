import { Link } from "react-router-dom";
import { Truck, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold">ExpressLivraison</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Votre partenaire de confiance pour toutes vos livraisons en France et en Europe. 
              Rapidité, fiabilité et professionnalisme.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/demande" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Demander une livraison
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Nos services</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>Livraison express</li>
              <li>Transport de colis</li>
              <li>Livraison B2B</li>
              <li>Service européen</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <Phone className="w-4 h-4 text-accent" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <Mail className="w-4 h-4 text-accent" />
                <span>contact@expresslivraison.fr</span>
              </li>
              <li className="flex items-start gap-2 text-primary-foreground/70">
                <MapPin className="w-4 h-4 text-accent mt-0.5" />
                <span>123 Avenue des Transports<br />75001 Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-primary-foreground/60 text-sm">
          <p>&copy; {new Date().getFullYear()} ExpressLivraison. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
