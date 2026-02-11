import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DeliveryRequestForm } from "@/components/DeliveryRequestForm";
import { VideoTutorialModal } from "@/components/VideoTutorialModal";
import { Package } from "lucide-react";
import { useRealtimeVisitor } from "@/hooks/useRealtimeVisitor";

const DeliveryRequest = () => {
  // Track page view in real-time (in-memory only)
  useRealtimeVisitor("Delivery Request Page", "DELIVERY_REQUEST");

  // Replace these with your actual video URLs
  const demandVideoUrl = "https://www.youtube.com/embed/xYubryX3vcY";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 lg:pt-24">
        {/* Hero */}
        <section className="bg-primary py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-2xl mb-4">
              <Package className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Demander une livraison
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Remplissez le formulaire ci-dessous et notre équipe vous contactera rapidement pour confirmer votre demande.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-card rounded-2xl shadow-lg border border-border p-6 lg:p-8">
              <DeliveryRequestForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Video Tutorial Popup */}
      <VideoTutorialModal
        videoUrl={demandVideoUrl}
        title="Comment créer une demande ?"
        description="Regardez ce tutoriel pour apprendre comment créer une demande de livraison en quelques étapes simples."
        autoShowDelay={2000}
      />
    </div>
  );
};

export default DeliveryRequest;
