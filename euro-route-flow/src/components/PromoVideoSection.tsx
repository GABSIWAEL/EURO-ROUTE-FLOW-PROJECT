import { useEffect, useRef, useState } from "react";
import { Play, Zap, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromoVideoSectionProps {
    videoUrl: string;
    title: string;
    description: string;
    features?: string[];
    cta?: {
        text: string;
        href: string;
    };
}

export function PromoVideoSection({
    videoUrl,
    title,
    description,
    features = [],
    cta,
}: PromoVideoSectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [shouldPlay, setShouldPlay] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                    // Delay autoplay slightly for smooth effect
                    setTimeout(() => {
                        setShouldPlay(true);
                    }, 300);
                }
            },
            {
                threshold: 0.3,
                rootMargin: "0px 0px -100px 0px",
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [isVisible]);

    return (
        <section
            ref={sectionRef}
            className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Description */}
                    <div
                        className={`transition-all duration-1000 ease-out ${isVisible
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 -translate-x-12"
                            }`}
                    >
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                    {title}
                                </h2>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    {description}
                                </p>
                            </div>

                            {/* Features List */}
                            {features.length > 0 && (
                                <div className="space-y-3">
                                    {features.map((feature, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-start gap-3 transition-all duration-500 ease-out ${isVisible
                                                    ? "opacity-100 translate-x-0"
                                                    : "opacity-0 -translate-x-8"
                                                }`}
                                            style={{
                                                transitionDelay: `${100 + index * 100}ms`,
                                            }}
                                        >
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                                                <Zap className="w-4 h-4 text-accent" />
                                            </div>
                                            <p className="text-slate-700 font-medium">{feature}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* CTA Button */}
                            {cta && (
                                <div
                                    className={`pt-4 transition-all duration-700 ease-out ${isVisible
                                            ? "opacity-100 translate-y-0"
                                            : "opacity-0 translate-y-8"
                                        }`}
                                    style={{ transitionDelay: "400ms" }}
                                >
                                    <Button
                                        variant="hero"
                                        size="lg"
                                        className="inline-flex items-center gap-2"
                                        asChild
                                    >
                                        <a href={cta.href}>
                                            <Play className="w-5 h-5" fill="currentColor" />
                                            {cta.text}
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Video */}
                    <div
                        className={`transition-all duration-1000 ease-out ${isVisible
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 translate-x-12"
                            }`}
                    >
                        <div className="relative">
                            {/* Video Container with shadow and border */}
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-accent/20 hover:border-accent/40 transition-all duration-300">
                                {/* Gradient overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 hover:from-accent/5 hover:to-accent/5 transition-all duration-300 z-10 pointer-events-none rounded-2xl" />

                                {/* Video */}
                                <div className="relative w-full pt-[56.25%] bg-slate-900">
                                    <iframe
                                        className="absolute inset-0 w-full h-full"
                                        src={`${videoUrl}${shouldPlay ? "?autoplay=1" : "?autoplay=0"}&mute=0`}
                                        title="ExpressLivraison - Service de Livraison"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
                            <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
