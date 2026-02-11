import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { deliveryRequestApi } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Package, Calendar, Phone, User, Mail, Map } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, MapConsumer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const deliverySchema = z.object({
  clientName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  clientPhone: z.string().min(10, "Numéro de téléphone invalide").max(20),
  clientEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  pickupAddress: z.string().min(5, "Adresse de collecte requise").max(500),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  pickupFromMap: z.boolean().optional(),
  deliveryAddress: z.string().min(5, "Adresse de livraison requise").max(500),
  deliveryLat: z.number().optional(),
  deliveryLng: z.number().optional(),
  deliveryFromMap: z.boolean().optional(),
  itemType: z.string().min(1, "Type d'article requis"),
  itemSize: z.string().optional(),
  itemWeight: z.string().optional(),
  requestedDate: z.string().min(1, "Date souhaitée requise"),
  requestedTime: z.string().optional(),
  clientNotes: z.string().max(1000).optional(),
});

type DeliveryFormData = z.infer<typeof deliverySchema>;

const itemTypes = [
  { value: "documents", label: "Documents" },
  { value: "colis_petit", label: "Petit colis (< 5kg)" },
  { value: "colis_moyen", label: "Colis moyen (5-20kg)" },
  { value: "colis_grand", label: "Grand colis (> 20kg)" },
  { value: "palette", label: "Palette" },
  { value: "fragile", label: "Article fragile" },
  { value: "autre", label: "Autre" },
];

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (address: string, lat?: number, lng?: number, fromMap?: boolean) => void;
  title: string;
}

// Fix Leaflet default icons issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const handleMapClick = (e: any) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, onLocationSelect]);

  return null;
}

function LocationModal({ isOpen, onClose, onSelectLocation, title }: LocationModalProps) {
  const [manualAddress, setManualAddress] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [useMap, setUseMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Default to Paris

  if (!isOpen) return null;

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleManualSubmit = () => {
    if (manualAddress.trim()) {
      onSelectLocation(manualAddress);
      onClose();
    }
  };

  const handleMapSubmit = () => {
    if (selectedLocation) {
      onSelectLocation(
        `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`,
        selectedLocation.lat,
        selectedLocation.lng,
        true // Pass true to indicate it came from map
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setUseMap(false)}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${!useMap
              ? "bg-accent text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Saisie manuelle
          </button>
          <button
            onClick={() => setUseMap(true)}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition flex items-center justify-center gap-2 ${useMap
              ? "bg-accent text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            <Map className="w-4 h-4" />
            Carte interactive
          </button>
        </div>

        {!useMap && (
          <div className="space-y-4">
            <Textarea
              placeholder="Entrez l'adresse complète (numéro, rue, code postal, ville)"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="hero"
                onClick={handleManualSubmit}
                className="flex-1"
                disabled={!manualAddress.trim()}
              >
                Confirmer
              </Button>
            </div>
          </div>
        )}

        {useMap && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              Cliquez sur la carte pour sélectionner une localisation
            </p>
            <div className="rounded-lg overflow-hidden border border-gray-300 h-96">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onLocationSelect={handleMapLocationSelect} />
                {selectedLocation && (
                  <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                    <Popup>
                      Localisation sélectionnée<br />
                      Lat: {selectedLocation.lat.toFixed(4)}<br />
                      Lng: {selectedLocation.lng.toFixed(4)}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            {selectedLocation && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                ✓ Localisation sélectionnée: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="hero"
                onClick={handleMapSubmit}
                className="flex-1"
                disabled={!selectedLocation}
              >
                Confirmer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DeliveryRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
  });

  const pickupAddress = watch("pickupAddress");
  const deliveryAddress = watch("deliveryAddress");

  const parseCoordinatesFromAddress = (address: string | undefined): { lat: number; lng: number } | null => {
    if (!address) return null;

    // Match pattern: "lat, lng" or "lat,lng"
    const coordPattern = /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/;
    const match = address.trim().match(coordPattern);

    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);

      // Validate coordinates are within valid range
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    return null;
  };

  const onSubmit = async (data: DeliveryFormData) => {
    setIsSubmitting(true);
    try {
      // Parse coordinates from address if not already set via map
      let pickupLat = data.pickupLat;
      let pickupLng = data.pickupLng;
      let deliveryLat = data.deliveryLat;
      let deliveryLng = data.deliveryLng;

      // Try to extract coordinates from pickup address if not set
      if (!pickupLat || !pickupLng) {
        const pickupCoords = parseCoordinatesFromAddress(data.pickupAddress);
        if (pickupCoords) {
          pickupLat = pickupCoords.lat;
          pickupLng = pickupCoords.lng;
        }
      }

      // Try to extract coordinates from delivery address if not set
      if (!deliveryLat || !deliveryLng) {
        const deliveryCoords = parseCoordinatesFromAddress(data.deliveryAddress);
        if (deliveryCoords) {
          deliveryLat = deliveryCoords.lat;
          deliveryLng = deliveryCoords.lng;
        }
      }

      await deliveryRequestApi.create({
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        clientEmail: data.clientEmail || null,
        pickupAddress: data.pickupAddress,
        pickupLat: pickupLat || null,
        pickupLng: pickupLng || null,
        pickupFromMap: data.pickupFromMap || false,
        deliveryAddress: data.deliveryAddress,
        deliveryLat: deliveryLat || null,
        deliveryLng: deliveryLng || null,
        deliveryFromMap: data.deliveryFromMap || false,
        itemType: data.itemType,
        itemSize: data.itemSize || null,
        itemWeight: data.itemWeight || null,
        requestedDate: data.requestedDate,
        requestedTime: data.requestedTime || null,
        clientNotes: data.clientNotes || null,
      });

      // Save the delivery request to localStorage for the confirmation page
      localStorage.setItem("lastDeliveryRequest", JSON.stringify(data));

      navigate("/confirmation");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Client Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-accent" />
          Vos coordonnées
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nom complet *</Label>
            <Input
              id="clientName"
              placeholder="Jean Dupont"
              {...register("clientName")}
              className={errors.clientName ? "border-destructive" : ""}
            />
            {errors.clientName && (
              <p className="text-sm text-destructive">{errors.clientName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientPhone">Téléphone *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="clientPhone"
                type="tel"
                placeholder="06 12 34 56 78"
                className={`pl-10 ${errors.clientPhone ? "border-destructive" : ""}`}
                {...register("clientPhone")}
              />
            </div>
            {errors.clientPhone && (
              <p className="text-sm text-destructive">{errors.clientPhone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientEmail">Email (optionnel)</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="clientEmail"
              type="email"
              placeholder="jean.dupont@email.com"
              className="pl-10"
              {...register("clientEmail")}
            />
          </div>
          {errors.clientEmail && (
            <p className="text-sm text-destructive">{errors.clientEmail.message}</p>
          )}
        </div>
      </div>

      {/* Addresses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          Adresses
        </h3>

        <div className="space-y-2">
          <Label htmlFor="pickupAddress">Adresse de collecte *</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea
                id="pickupAddress"
                placeholder="Numéro, rue, code postal, ville"
                rows={2}
                {...register("pickupAddress")}
                className={errors.pickupAddress ? "border-destructive" : ""}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPickupModalOpen(true)}
              className="self-start mt-2"
              title="Ajouter localisation depuis la carte ou GPS"
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
          {errors.pickupAddress && (
            <p className="text-sm text-destructive">{errors.pickupAddress.message}</p>
          )}
          {watch("pickupFromMap") && (
            <div className="flex items-center gap-2">
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                📍 Depuis la carte
              </span>
              <p className="text-xs text-green-600">
                {watch("pickupLat")?.toFixed(4)}, {watch("pickupLng")?.toFixed(4)}
              </p>
            </div>
          )}
          {pickupAddress && !watch("pickupFromMap") && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              ✓ Adresse définie
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryAddress">Adresse de livraison *</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea
                id="deliveryAddress"
                placeholder="Numéro, rue, code postal, ville"
                rows={2}
                {...register("deliveryAddress")}
                className={errors.deliveryAddress ? "border-destructive" : ""}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeliveryModalOpen(true)}
              className="self-start mt-2"
              title="Ajouter localisation depuis la carte ou GPS"
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
          {errors.deliveryAddress && (
            <p className="text-sm text-destructive">{errors.deliveryAddress.message}</p>
          )}
          {watch("deliveryFromMap") && (
            <div className="flex items-center gap-2">
              <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                📦 Depuis la carte
              </span>
              <p className="text-xs text-red-600">
                {watch("deliveryLat")?.toFixed(4)}, {watch("deliveryLng")?.toFixed(4)}
              </p>
            </div>
          )}
          {deliveryAddress && !watch("deliveryFromMap") && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              ✓ Adresse définie
            </p>
          )}
        </div>
      </div>

      {/* Package Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Package className="w-5 h-5 text-accent" />
          Détails du colis
        </h3>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="itemType">Type d'article *</Label>
            <Select onValueChange={(value) => setValue("itemType", value)}>
              <SelectTrigger className={errors.itemType ? "border-destructive" : ""}>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {itemTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.itemType && (
              <p className="text-sm text-destructive">{errors.itemType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemSize">Dimensions (optionnel)</Label>
            <Input
              id="itemSize"
              placeholder="Ex: 30x20x15 cm"
              {...register("itemSize")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemWeight">Poids (optionnel)</Label>
            <Input
              id="itemWeight"
              placeholder="Ex: 5 kg"
              {...register("itemWeight")}
            />
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" />
          Date souhaitée
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="requestedDate">Date de collecte *</Label>
            <Input
              id="requestedDate"
              type="date"
              min={today}
              {...register("requestedDate")}
              className={errors.requestedDate ? "border-destructive" : ""}
            />
            {errors.requestedDate && (
              <p className="text-sm text-destructive">{errors.requestedDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestedTime">Créneau horaire (optionnel)</Label>
            <Select onValueChange={(value) => setValue("requestedTime", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Indifférent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matin">Matin (8h-12h)</SelectItem>
                <SelectItem value="apres-midi">Après-midi (14h-18h)</SelectItem>
                <SelectItem value="soir">Soir (18h-20h)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="clientNotes">Instructions particulières (optionnel)</Label>
        <Textarea
          id="clientNotes"
          placeholder="Code d'accès, étage, instructions spéciales..."
          rows={3}
          {...register("clientNotes")}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="hero"
        size="xl"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Envoyer ma demande"
        )}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        * Champs obligatoires. Nous vous contacterons dans les plus brefs délais.
      </p>

      {/* Location Modals */}
      <LocationModal
        isOpen={pickupModalOpen}
        onClose={() => setPickupModalOpen(false)}
        onSelectLocation={(address, lat, lng, fromMap) => {
          setValue("pickupAddress", address);
          if (lat && lng) {
            setValue("pickupLat", lat);
            setValue("pickupLng", lng);
            if (fromMap) {
              setValue("pickupFromMap", true);
            }
          }
        }}
        title="Sélectionner lieu de collecte"
      />

      <LocationModal
        isOpen={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
        onSelectLocation={(address, lat, lng, fromMap) => {
          setValue("deliveryAddress", address);
          if (lat && lng) {
            setValue("deliveryLat", lat);
            setValue("deliveryLng", lng);
            if (fromMap) {
              setValue("deliveryFromMap", true);
            }
          }
        }}
        title="Sélectionner lieu de livraison"
      />
    </form>
  );
}
