import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import deliveryAbout from "@/assets/delivery-about.png";

export function AboutSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 pt-36 bg-background" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-accent font-semibold mb-2">Qui Sommes-nous</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Notre entreprise de Livraison
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto mt-3 rounded-full" />
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mt-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              <img
                src={deliveryAbout}
                alt="Notre équipe de livraison"
                className="rounded-2xl shadow-xl max-h-[480px] object-cover"
              />
              {/* Decorative accent border */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-accent rounded-2xl -z-10" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Reconnue pour son savoir-faire
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Notre entreprise est reconnue pour le savoir-faire de ses livreurs ainsi que par la diversité de ses services adaptables à tous les besoins.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              La gamme des prestations qu'on met à la disposition de nos chers clients a été bien élaborée et étudiée pour répondre aux différentes attentes en assurant toujours sécurité et flexibilité pour chaque projet de livraison.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-card rounded-xl p-6 border border-border text-center shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl font-extrabold text-accent mb-1">+15</div>
                <div className="text-sm text-muted-foreground">Années d'expérience</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="bg-card rounded-xl p-6 border border-border text-center shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl font-extrabold text-accent mb-1">15k</div>
                <div className="text-sm text-muted-foreground">Clients satisfaits</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
