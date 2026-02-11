import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Truck, Users, Award, Globe } from "lucide-react";
import { useRealtimeVisitor } from "@/hooks/useRealtimeVisitor";

const About = () => {
  // Track page view in real-time (in-memory only)
  useRealtimeVisitor("About Page", "ABOUT_PAGE");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 lg:pt-24">
        {/* Hero */}
        <section className="bg-primary py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              À propos d'ExpressLivraison
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Votre partenaire de confiance pour toutes vos livraisons depuis plus de 10 ans
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Notre histoire</h2>
              <div className="prose prose-lg text-muted-foreground">
                <p className="mb-4">
                  Fondée en 2010, ExpressLivraison est née d'une vision simple : offrir un service de livraison 
                  professionnel, fiable et humain. Contrairement aux plateformes de mise en relation, nous employons 
                  directement tous nos chauffeurs, garantissant ainsi une qualité de service constante.
                </p>
                <p className="mb-4">
                  Notre équipe de professionnels expérimentés s'engage chaque jour à livrer vos colis avec le plus 
                  grand soin. De Paris à l'Europe entière, nous avons développé un réseau logistique efficace 
                  permettant des livraisons rapides et sécurisées.
                </p>
                <p>
                  Aujourd'hui, nous sommes fiers de compter parmi nos clients des entreprises de toutes tailles 
                  ainsi que des particuliers exigeants qui nous font confiance pour leurs envois les plus importants.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">Nos valeurs</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Fiabilité</h3>
                <p className="text-sm text-muted-foreground">Vos colis arrivent à destination, dans les délais promis</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Proximité</h3>
                <p className="text-sm text-muted-foreground">Une équipe à votre écoute, des interlocuteurs dédiés</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Excellence</h3>
                <p className="text-sm text-muted-foreground">La qualité de service au cœur de nos préoccupations</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Europe</h3>
                <p className="text-sm text-muted-foreground">Un réseau étendu pour servir toute l'Europe</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-accent mb-2">15 000+</div>
                <div className="text-muted-foreground">Livraisons par an</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">50+</div>
                <div className="text-muted-foreground">Chauffeurs employés</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">98%</div>
                <div className="text-muted-foreground">Clients satisfaits</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">12</div>
                <div className="text-muted-foreground">Pays desservis</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
