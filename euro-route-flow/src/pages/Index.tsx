import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { PromoVideoSection } from "@/components/PromoVideoSection";
import { ServicesSection } from "@/components/ServicesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { CTASection } from "@/components/CTASection";
import { AboutSection } from "@/components/AboutSection";
import { useRealtimeVisitor } from "@/hooks/useRealtimeVisitor";

const Index = () => {
  // Track page view in real-time (in-memory only)
  useRealtimeVisitor("Landing Page", "LANDING_PAGE");

  // Replace this with your actual promotional video URL
  const promoVideoUrl = "https://www.youtube.com/embed/xYubryX3vcY";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />

        {/* Promotional Video Section */}
        <PromoVideoSection
          videoUrl={promoVideoUrl}
          title="ExpressLivraison - Votre Solution de Livraison Fiable"
          description="Découvrez comment ExpressLivraison révolutionne le service de livraison en offrant une solution rapide, fiable et efficace pour tous vos besoins logistiques. De la collecte à la livraison finale, nous assurons que vos colis arrivent à bon port."
          features={[
            "Suivi en temps réel de vos livraisons",
            "Équipe de chauffeurs professionnels disponibles 24/7",
            "Tarifs compétitifs et transparents",
            "Couverture étendue sur toute la région",
          ]}
          cta={{
            text: "Commencer une livraison",
            href: "/delivery-request",
          }}
        />

        <AboutSection />
        <ServicesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
