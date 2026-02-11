import { ClipboardList, UserCheck, Truck, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Demande en ligne",
    description: "Remplissez notre formulaire simple avec les détails de votre livraison.",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Confirmation",
    description: "Notre équipe valide votre demande et vous attribue un chauffeur.",
  },
  {
    icon: Truck,
    step: "03",
    title: "Enlèvement",
    description: "Notre chauffeur récupère votre colis à l'adresse indiquée.",
  },
  {
    icon: CheckCircle2,
    step: "04",
    title: "Livraison",
    description: "Votre colis est livré en toute sécurité à destination.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un processus simple et transparent en 4 étapes
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-border" />
              )}
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-card rounded-2xl shadow-md flex items-center justify-center border border-border">
                    <step.icon className="w-8 h-8 text-accent" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
