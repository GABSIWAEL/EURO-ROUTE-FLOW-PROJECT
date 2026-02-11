import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Truck, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import trucksBg from "@/assets/trucks-bg.jpg";
import deliveryHero from "@/assets/delivery-hero.png";
import delivery from "@/assets/delivery.png";
import delivery1 from "@/assets/one.webp";
import delivery2 from "@/assets/two.jpeg";

const deliveryImages = [delivery, delivery1, delivery2];

export function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % deliveryImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % deliveryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + deliveryImages.length) % deliveryImages.length);
  };
  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={trucksBg}
          alt="Flotte de camions de livraison"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/75 to-primary/30" />
      </div>

      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-56 h-56 bg-accent/5 rounded-full blur-2xl" />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32 pb-44 lg:pb-56">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm"
            >
              <Shield className="w-4 h-4" />
              Service de confiance depuis 2010
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-primary-foreground leading-tight mb-4">
              Livraison à Travers Toute la{" "}
              <span className="text-accent">France & Europe</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Solutions sur mesure pour particuliers et entreprises.
              Service express, suivi en temps réel et satisfaction garantie.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/demande">
                <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                  Demander une livraison
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                  Nous contacter
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-primary-foreground/10"
            >
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-accent">15k+</div>
                <div className="text-xs text-primary-foreground/60">Livraisons/an</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-accent">98%</div>
                <div className="text-xs text-primary-foreground/60">Satisfaction</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-accent">24h</div>
                <div className="text-xs text-primary-foreground/60">Délai moyen</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Delivery Person Image Carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 60 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:flex justify-end items-end relative"
          >
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={deliveryImages[currentImageIndex]}
                  alt={`Livreur professionnel ${currentImageIndex + 1}`}
                  className="h-[520px] object-contain"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>



              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                {deliveryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
                      }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>


    </section>
  );
}
