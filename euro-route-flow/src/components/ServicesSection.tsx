import { Package, Zap, Globe, Building2, Wrench, Box } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Zap,
    title: "Livraison Express",
    description: "Livraison le jour même ou J+1 pour vos envois urgents. Idéal pour les documents importants et colis prioritaires.",
  },
  {
    icon: Building2,
    title: "Transfert Entreprises",
    description: "Solutions logistiques sur mesure pour les entreprises. Contrats dédiés et facturation mensuelle.",
  },
  {
    icon: Package,
    title: "Transport de Colis",
    description: "Transport sécurisé de colis de toutes tailles. Emballage professionnel et manipulation avec soin.",
  },
  {
    icon: Box,
    title: "Service Emballage",
    description: "Vos meubles ou matériels sont protégés grâce à notre service d'emballage professionnel.",
  },
  {
    icon: Wrench,
    title: "Montage / Démontage",
    description: "Service de montage et démontage professionnel pour vos meubles et équipements.",
  },
  {
    icon: Globe,
    title: "Livraison Européenne",
    description: "Réseau étendu couvrant la France et l'Europe. Délais optimisés et tarifs compétitifs.",
  },
];

export function ServicesSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-20 bg-muted/30" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-accent font-semibold mb-2">Services de Qualité</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Vous avez besoin d'un service de livraison de qualité ?
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto mt-3 rounded-full" />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="group bg-card rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-accent/30 h-full hover:-translate-y-1">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                  <service.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {service.description}
                </p>
                <Link
                  to="/demande"
                  className="text-accent font-semibold text-sm hover:underline inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  En savoir plus →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
