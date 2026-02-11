import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Home, MapPin, Phone, Mail } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRealtimeVisitor } from "@/hooks/useRealtimeVisitor";

interface DeliveryRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  itemType: string;
  itemSize?: string;
  itemWeight?: string;
  requestedDate: string;
  requestedTime?: string;
  clientNotes?: string;
}

// Fix Leaflet default icons issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom icon for pickup location (green)
const pickupIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom icon for delivery location (red)
const deliveryIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Confirmation = () => {
  // Track page view in real-time (in-memory only)
  useRealtimeVisitor("Confirmation Page", "CONFIRMATION_PAGE");

  const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);

  useEffect(() => {
    // Try to get the delivery request from localStorage
    const storedDelivery = localStorage.getItem("lastDeliveryRequest");
    if (storedDelivery) {
      setDelivery(JSON.parse(storedDelivery));
    }
  }, []);

  const calculateMapCenter = (): [number, number] => {
    if (delivery?.pickupLat && delivery?.pickupLng && delivery?.deliveryLat && delivery?.deliveryLng) {
      const centerLat = (delivery.pickupLat + delivery.deliveryLat) / 2;
      const centerLng = (delivery.pickupLng + delivery.deliveryLng) / 2;
      return [centerLat, centerLng];
    } else if (delivery?.pickupLat && delivery?.pickupLng) {
      return [delivery.pickupLat, delivery.pickupLng];
    } else if (delivery?.deliveryLat && delivery?.deliveryLng) {
      return [delivery.deliveryLat, delivery.deliveryLng];
    }
    return [48.8566, 2.3522]; // Default to Paris
  };

  const calculateZoom = (): number => {
    if (delivery?.pickupLat && delivery?.pickupLng && delivery?.deliveryLat && delivery?.deliveryLng) {
      // If we have both locations, zoom out a bit to see both
      const latDiff = Math.abs(delivery.pickupLat - delivery.deliveryLat);
      const lngDiff = Math.abs(delivery.pickupLng - delivery.deliveryLng);
      const maxDiff = Math.max(latDiff, lngDiff);
      if (maxDiff > 0.1) return 10;
      if (maxDiff > 0.05) return 12;
      return 13;
    }
    return 13;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 lg:pt-24 pb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Success Section */}
          <div className="max-w-lg mx-auto text-center mb-12">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-fade-in">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 animate-slide-up">
              Demande envoyée !
            </h1>

            <p className="text-lg text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Merci pour votre confiance. Votre demande de livraison a été enregistrée avec succès.
              Notre équipe vous contactera dans les plus brefs délais pour confirmer les détails.
            </p>
          </div>

          {/* Delivery Details with Map */}
          {delivery && (
            <div className="max-w-4xl mx-auto mb-12 space-y-8">
              {/* Delivery Summary */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MapPin className="w-6 h-6" />
                    Détails de votre demande
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Client Info */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Nom</p>
                      <p className="text-lg font-semibold text-gray-800">{delivery.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Téléphone
                      </p>
                      <p className="text-lg font-semibold text-gray-800">{delivery.clientPhone}</p>
                    </div>
                    {delivery.clientEmail && (
                      <div className="sm:col-span-2">
                        <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          Email
                        </p>
                        <p className="text-lg font-semibold text-gray-800">{delivery.clientEmail}</p>
                      </div>
                    )}
                  </div>

                  {/* Addresses */}
                  <div className="border-t pt-6 space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <p className="text-sm text-gray-600 font-medium">Lieu de collecte</p>
                      </div>
                      <p className="text-base text-gray-800">{delivery.pickupAddress}</p>
                      {delivery.pickupLat && delivery.pickupLng && (
                        <p className="text-xs text-gray-500 mt-1">
                          ({delivery.pickupLat.toFixed(4)}, {delivery.pickupLng.toFixed(4)})
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <p className="text-sm text-gray-600 font-medium">Lieu de livraison</p>
                      </div>
                      <p className="text-base text-gray-800">{delivery.deliveryAddress}</p>
                      {delivery.deliveryLat && delivery.deliveryLng && (
                        <p className="text-xs text-gray-500 mt-1">
                          ({delivery.deliveryLat.toFixed(4)}, {delivery.deliveryLng.toFixed(4)})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-gray-800">Détails du colis</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Type</p>
                        <p className="font-semibold text-gray-800 capitalize">{delivery.itemType}</p>
                      </div>
                      {delivery.itemSize && (
                        <div>
                          <p className="text-sm text-gray-600">Dimensions</p>
                          <p className="font-semibold text-gray-800">{delivery.itemSize}</p>
                        </div>
                      )}
                      {delivery.itemWeight && (
                        <div>
                          <p className="text-sm text-gray-600">Poids</p>
                          <p className="font-semibold text-gray-800">{delivery.itemWeight}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-gray-800">Date et horaire</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Date demandée</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(delivery.requestedDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      {delivery.requestedTime && (
                        <div>
                          <p className="text-sm text-gray-600">Créneau horaire</p>
                          <p className="font-semibold text-gray-800 capitalize">{delivery.requestedTime}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {delivery.clientNotes && (
                    <div className="border-t pt-6">
                      <p className="text-sm text-gray-600 font-medium mb-2">Notes supplémentaires</p>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded">{delivery.clientNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Map Section */}
              {(delivery.pickupLat || delivery.deliveryLat) && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <MapPin className="w-6 h-6" />
                      Localisation de la livraison
                    </h2>
                  </div>

                  <div className="p-6">
                    <div className="rounded-lg overflow-hidden border border-gray-300 h-96">
                      <MapContainer
                        center={calculateMapCenter()}
                        zoom={calculateZoom()}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {delivery.pickupLat && delivery.pickupLng && (
                          <Marker position={[delivery.pickupLat, delivery.pickupLng]} icon={pickupIcon}>
                            <Popup>
                              <div>
                                <strong>Collecte</strong>
                                <p className="text-sm">{delivery.pickupAddress}</p>
                              </div>
                            </Popup>
                          </Marker>
                        )}
                        {delivery.deliveryLat && delivery.deliveryLng && (
                          <Marker position={[delivery.deliveryLat, delivery.deliveryLng]} icon={deliveryIcon}>
                            <Popup>
                              <div>
                                <strong>Livraison</strong>
                                <p className="text-sm">{delivery.deliveryAddress}</p>
                              </div>
                            </Popup>
                          </Marker>
                        )}
                      </MapContainer>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span>Lieu de collecte</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span>Lieu de livraison</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* What's Next */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="bg-secondary rounded-xl p-6 text-left">
              <h3 className="font-semibold text-foreground mb-4">Que se passe-t-il ensuite ?</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                    1
                  </span>
                  <span className="text-muted-foreground">Notre équipe examine votre demande</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                    2
                  </span>
                  <span className="text-muted-foreground">Nous vous contactons pour confirmer les détails et le tarif</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                    3
                  </span>
                  <span className="text-muted-foreground">Un chauffeur est assigné à votre livraison</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Actions */}
          <div className="max-w-lg mx-auto flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
            <Link to="/demande">
              <Button variant="default" size="lg" className="w-full sm:w-auto">
                Nouvelle demande
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Confirmation;
