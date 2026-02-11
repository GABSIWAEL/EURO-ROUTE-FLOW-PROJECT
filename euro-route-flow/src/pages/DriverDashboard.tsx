import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { deliveryRequestApi, driverApi } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
    Truck,
    LogOut,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Package,
    Loader2,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DeliveryRequest {
    id: string;
    clientName: string;
    clientEmail: string | null;
    clientPhone: string;
    pickupAddress: string;
    pickupLat?: number | null;
    pickupLng?: number | null;
    pickupFromMap?: boolean;
    deliveryAddress: string;
    deliveryLat?: number | null;
    deliveryLng?: number | null;
    deliveryFromMap?: boolean;
    itemType: string;
    itemWeight: string | null;
    itemSize: string | null;
    requestedDate: string;
    requestedTime: string | null;
    status: string;
    clientNotes: string | null;
    internalNotes: string | null;
    trackingNumber: string | null;
    createdAt: string;
    assignedDriverId: string | null;
}

// Fix Leaflet default icons issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface DriverInfo {
    id: string;
    fullName: string;
    email: string | null;
    phone: string;
    userId: string;
}

const DriverDashboard = () => {
    const navigate = useNavigate();
    const { user, userRole, isLoading: authLoading, signOut } = useAuth();
    const { toast } = useToast();

    const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
    const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRequest | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isSaving, setIsSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    type DeliveryStatus = "en_attente" | "en_cours" | "livre";

    const parseCoordinatesFromAddress = (address: string): { lat: number; lng: number } | null => {
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

    useEffect(() => {
        // Wait for auth to finish loading before checking role
        if (authLoading) {
            return;
        }

        if (!user) {
            navigate("/admin");
            return;
        }

        if (userRole !== "driver") {
            navigate("/");
            return;
        }

        fetchData();
    }, [user, userRole, navigate]);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Fetch driver info - get my profile
            const myDriver = await driverApi.getMyProfile() as DriverInfo;
            setDriverInfo(myDriver);

            // Fetch assigned deliveries
            const deliveriesData = await deliveryRequestApi.getByDriver(myDriver.id) as DeliveryRequest[];
            setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : []);
        } catch (error) {
            // console.error("Error fetching data:", error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors du chargement des données.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (deliveryId: string, newStatus: DeliveryStatus) => {
        try {
            setIsSaving(true);

            await deliveryRequestApi.update(deliveryId, {
                status: newStatus,
                ...(newStatus === "livre" && { completedAt: new Date().toISOString() }),
            });

            // Update local state
            setDeliveries(
                deliveries.map((d) =>
                    d.id === deliveryId
                        ? {
                            ...d,
                            status: newStatus,
                        }
                        : d
                )
            );

            if (selectedDelivery && selectedDelivery.id === deliveryId) {
                setSelectedDelivery({
                    ...selectedDelivery,
                    status: newStatus,
                });
            }

            toast({
                title: "Succès",
                description: "Statut de la livraison mis à jour.",
            });
        } catch (error) {
            // console.error("Error updating status:", error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    const filteredDeliveries =
        statusFilter === "all"
            ? deliveries
            : deliveries.filter((d) => d.status === statusFilter.toUpperCase());

    // Pagination calculations
    const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);

    const stats = {
        pending: deliveries.filter((d) => d.status === "EN_ATTENTE").length,
        in_transit: deliveries.filter((d) => d.status === "EN_COURS").length,
        completed: deliveries.filter((d) => d.status === "LIVRE").length,
        total: deliveries.length,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-primary shadow-lg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                                <Truck className="w-6 h-6 text-accent-foreground" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-primary-foreground">
                                    ExpressLivraison
                                </span>
                                <span className="text-primary-foreground/60 text-sm block">
                                    Chauffeur
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                to="/"
                                className="text-primary-foreground/70 hover:text-primary-foreground text-sm"
                            >
                                Voir le site
                            </Link>
                            <Button onClick={handleLogout} variant="heroOutline" size="sm">
                                <LogOut className="w-4 h-4 mr-2" />
                                Déconnexion
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Driver Info Card */}
                {driverInfo && (
                    <div className="bg-card rounded-xl p-4 shadow-sm border border-border mb-8">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Informations du chauffeur</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Nom</p>
                                    <p className="font-semibold text-foreground">{driverInfo.fullName}</p>
                                </div>
                            </div>
                            {driverInfo.email && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-semibold text-foreground text-sm">{driverInfo.email}</p>
                                    </div>
                                </div>
                            )}
                            {driverInfo.phone && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Téléphone</p>
                                        <p className="font-semibold text-foreground">{driverInfo.phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                                <p className="text-sm text-muted-foreground">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                                <p className="text-sm text-muted-foreground">En attente</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Truck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.in_transit}</p>
                                <p className="text-sm text-muted-foreground">En transit</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                                <p className="text-sm text-muted-foreground">Complétées</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deliveries Section */}
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Demandes de livraison</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {filteredDeliveries.length} demande(s) trouvée(s)
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchData}
                                disabled={isLoading}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                                <span className="hidden sm:inline">Actualiser</span>
                            </Button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === "all"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-foreground hover:bg-secondary/80"
                                    }`}
                            >
                                Tous
                            </button>
                            <button
                                onClick={() => setStatusFilter("en_attente")}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === "en_attente"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-foreground hover:bg-secondary/80"
                                    }`}
                            >
                                En attente
                            </button>
                            <button
                                onClick={() => setStatusFilter("en_cours")}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === "en_cours"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-foreground hover:bg-secondary/80"
                                    }`}
                            >
                                En transit
                            </button>
                            <button
                                onClick={() => setStatusFilter("livre")}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === "livre"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-foreground hover:bg-secondary/80"
                                    }`}
                            >
                                Complétées
                            </button>
                        </div>

                        {filteredDeliveries.length === 0 ? (
                            <div className="text-center py-8">
                                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">Aucune demande de livraison trouvée.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Adresse de livraison</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedDeliveries.map((delivery) => (
                                            <TableRow key={delivery.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        {new Date(delivery.requestedDate).toLocaleDateString("fr-FR")}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">{delivery.clientName}</TableCell>
                                                <TableCell className="text-sm">
                                                    <div className="flex items-start gap-1">
                                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                                        <span className="line-clamp-1">{delivery.deliveryAddress}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={delivery.status as DeliveryStatus} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedDelivery(delivery)}
                                                    >
                                                        Détails
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {filteredDeliveries.length > 0 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Affichage {startIndex + 1} à {Math.min(endIndex, filteredDeliveries.length)} sur {filteredDeliveries.length}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Précédent
                                    </Button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                    {totalPages > 5 && (
                                        <span className="text-muted-foreground">...</span>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Suivant
                                    </Button>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="ml-4 px-2 py-1 border border-border rounded-md text-sm bg-background text-foreground"
                                    >
                                        <option value="10">10 par page</option>
                                        <option value="20">20 par page</option>
                                        <option value="50">50 par page</option>
                                        <option value="100">100 par page</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Delivery Details Dialog */}
            {selectedDelivery && (
                <Dialog open={!!selectedDelivery} onOpenChange={(open) => !open && setSelectedDelivery(null)}>
                    <DialogContent className="max-w-xl mx-auto my-8 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Détails de la livraison</DialogTitle>
                            <DialogDescription>
                                Demande créée le {new Date(selectedDelivery.createdAt).toLocaleDateString("fr-FR")}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Map Display */}
                            {(() => {
                                let pickupLat = selectedDelivery.pickupLat ? Number(selectedDelivery.pickupLat) : null;
                                let pickupLng = selectedDelivery.pickupLng ? Number(selectedDelivery.pickupLng) : null;
                                let deliveryLat = selectedDelivery.deliveryLat ? Number(selectedDelivery.deliveryLat) : null;
                                let deliveryLng = selectedDelivery.deliveryLng ? Number(selectedDelivery.deliveryLng) : null;

                                // Try to parse coordinates from address strings if lat/lng are null
                                if (pickupLat === null || pickupLng === null) {
                                    const pickupCoords = parseCoordinatesFromAddress(selectedDelivery.pickupAddress);
                                    if (pickupCoords) {
                                        pickupLat = pickupCoords.lat;
                                        pickupLng = pickupCoords.lng;
                                    }
                                }

                                if (deliveryLat === null || deliveryLng === null) {
                                    const deliveryCoords = parseCoordinatesFromAddress(selectedDelivery.deliveryAddress);
                                    if (deliveryCoords) {
                                        deliveryLat = deliveryCoords.lat;
                                        deliveryLng = deliveryCoords.lng;
                                    }
                                }

                                const hasValidPickupCoords = pickupLat !== null && pickupLng !== null && !isNaN(pickupLat) && !isNaN(pickupLng);
                                const hasValidDeliveryCoords = deliveryLat !== null && deliveryLng !== null && !isNaN(deliveryLat) && !isNaN(deliveryLng);
                                const hasValidCoords = hasValidPickupCoords && hasValidDeliveryCoords;

                                if (hasValidCoords) {
                                    return (
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-400 p-4 shadow-md">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-blue-900">
                                                <MapPin className="w-6 h-6 text-blue-600" />
                                                Carte de la livraison
                                            </h3>
                                            <div className="rounded-lg overflow-hidden border-2 border-blue-300 bg-gray-100" style={{ height: "400px", width: "100%", position: "relative" }}>
                                                <MapContainer
                                                    key={`map-${selectedDelivery.id}-${Date.now()}`}
                                                    center={[
                                                        (pickupLat + deliveryLat) / 2,
                                                        (pickupLng + deliveryLng) / 2
                                                    ]}
                                                    zoom={11}
                                                    style={{ height: "100%", width: "100%", zIndex: 10 }}
                                                    scrollWheelZoom={true}
                                                    attributionControl={true}
                                                >
                                                    <TileLayer
                                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        maxZoom={19}
                                                    />
                                                    {/* PICKUP MARKER - GREEN */}
                                                    <Marker
                                                        position={[pickupLat, pickupLng]}
                                                        icon={new L.Icon({
                                                            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
                                                            iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
                                                            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
                                                            iconSize: [25, 41],
                                                            iconAnchor: [12, 41],
                                                            popupAnchor: [1, -34],
                                                            shadowSize: [41, 41],
                                                        })}
                                                    >
                                                        <Popup>
                                                            <div className="text-sm p-2">
                                                                <p className="font-bold text-green-700">📍 COLLECTE</p>
                                                                <p className="text-xs mt-1">{selectedDelivery.pickupAddress}</p>
                                                                <p className="text-xs text-gray-600 mt-1">{pickupLat.toFixed(6)}, {pickupLng.toFixed(6)}</p>
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                    {/* DELIVERY MARKER - RED */}
                                                    <Marker
                                                        position={[deliveryLat, deliveryLng]}
                                                        icon={new L.Icon({
                                                            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                                                            iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
                                                            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
                                                            iconSize: [25, 41],
                                                            iconAnchor: [12, 41],
                                                            popupAnchor: [1, -34],
                                                            shadowSize: [41, 41],
                                                        })}
                                                    >
                                                        <Popup>
                                                            <div className="text-sm p-2">
                                                                <p className="font-bold text-red-700">📦 LIVRAISON</p>
                                                                <p className="text-xs mt-1">{selectedDelivery.deliveryAddress}</p>
                                                                <p className="text-xs text-gray-600 mt-1">{deliveryLat.toFixed(6)}, {deliveryLng.toFixed(6)}</p>
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                </MapContainer>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                <div className="bg-white rounded-lg p-3 border-2 border-green-300 shadow-sm">
                                                    <p className="font-bold text-green-700 text-sm mb-1">📍 COLLECTE</p>
                                                    <p className="text-xs text-gray-700 mb-2">{selectedDelivery.pickupAddress}</p>
                                                    <div className="bg-green-50 p-2 rounded text-xs font-mono text-green-700">
                                                        {pickupLat.toFixed(6)}<br />
                                                        {pickupLng.toFixed(6)}
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border-2 border-red-300 shadow-sm">
                                                    <p className="font-bold text-red-700 text-sm mb-1">📦 LIVRAISON</p>
                                                    <p className="text-xs text-gray-700 mb-2">{selectedDelivery.deliveryAddress}</p>
                                                    <div className="bg-red-50 p-2 rounded text-xs font-mono text-red-700">
                                                        {deliveryLat.toFixed(6)}<br />
                                                        {deliveryLng.toFixed(6)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 shadow-md">
                                            <p className="text-yellow-800 text-sm font-semibold flex items-center gap-2">
                                                <MapPin className="w-5 h-5" />
                                                ⚠️ Carte non disponible
                                            </p>
                                            <p className="text-yellow-700 text-xs mt-2">Les coordonnées GPS ne sont pas disponibles pour cette livraison.</p>
                                        </div>
                                    );
                                }
                            })()}

                            {/* Status Update */}
                            <div className="border-t pt-6">
                                <label className="block text-sm font-medium text-slate-900 mb-2">
                                    Statut actuel
                                </label>
                                <div className="flex items-center gap-2 mb-3">
                                    <StatusBadge status={selectedDelivery.status as DeliveryStatus} />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant={selectedDelivery.status === "en_attente" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedDelivery.id, "en_attente")}
                                        disabled={isSaving}
                                        className="flex items-center gap-1"
                                    >
                                        {isSaving && selectedDelivery.status !== "en_attente" && (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        )}
                                        En attente
                                    </Button>
                                    <Button
                                        variant={selectedDelivery.status === "en_cours" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedDelivery.id, "en_cours")}
                                        disabled={isSaving}
                                        className="flex items-center gap-1"
                                    >
                                        {isSaving && selectedDelivery.status !== "en_cours" && (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        )}
                                        <Clock className="w-3 h-3" />
                                        En transit
                                    </Button>
                                    <Button
                                        variant={selectedDelivery.status === "livre" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedDelivery.id, "livre")}
                                        disabled={isSaving}
                                        className="flex items-center gap-1"
                                    >
                                        {isSaving && selectedDelivery.status !== "livre" && (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        )}
                                        <CheckCircle2 className="w-3 h-3" />
                                        Complétée
                                    </Button>
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="border-t pt-6">
                                <h3 className="font-semibold text-slate-900 mb-3">Informations du client</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-600">Nom</p>
                                        <p className="font-medium">{selectedDelivery.clientName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Téléphone</p>
                                        <p className="font-medium">{selectedDelivery.clientPhone}</p>
                                    </div>
                                    {selectedDelivery.clientEmail && (
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-slate-600">Email</p>
                                            <p className="font-medium break-all">{selectedDelivery.clientEmail}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Delivery Details */}
                            <div className="border-t pt-6">
                                <h3 className="font-semibold text-slate-900 mb-3">Détails de la livraison</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-slate-600">Adresse de départ</p>
                                        <p className="font-medium">{selectedDelivery.pickupAddress}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Adresse de livraison</p>
                                        <p className="font-medium">{selectedDelivery.deliveryAddress}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-slate-600">Type d'article</p>
                                            <p className="font-medium">{selectedDelivery.itemType}</p>
                                        </div>
                                        {selectedDelivery.itemWeight && (
                                            <div>
                                                <p className="text-sm text-slate-600">Poids</p>
                                                <p className="font-medium">{selectedDelivery.itemWeight}</p>
                                            </div>
                                        )}
                                        {selectedDelivery.itemSize && (
                                            <div>
                                                <p className="text-sm text-slate-600">Taille</p>
                                                <p className="font-medium">{selectedDelivery.itemSize}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="border-t pt-6">
                                <h3 className="font-semibold text-slate-900 mb-3">Dates et heures</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-600">Date demandée</p>
                                        <p className="font-medium">
                                            {new Date(selectedDelivery.requestedDate).toLocaleDateString("fr-FR")}
                                        </p>
                                    </div>
                                    {selectedDelivery.requestedTime && (
                                        <div>
                                            <p className="text-sm text-slate-600">Heure demandée</p>
                                            <p className="font-medium">{selectedDelivery.requestedTime}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {(selectedDelivery.clientNotes || selectedDelivery.internalNotes) && (
                                <div className="border-t pt-6">
                                    <h3 className="font-semibold text-slate-900 mb-3">Notes</h3>
                                    {selectedDelivery.clientNotes && (
                                        <div className="mb-3">
                                            <p className="text-sm font-medium text-slate-600">Notes du client</p>
                                            <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                                                {selectedDelivery.clientNotes}
                                            </p>
                                        </div>
                                    )}
                                    {selectedDelivery.internalNotes && (
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">Notes internes</p>
                                            <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                                                {selectedDelivery.internalNotes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tracking */}
                            {selectedDelivery.tracking_number && (
                                <div className="border-t pt-6">
                                    <p className="text-sm text-slate-600">Numéro de suivi</p>
                                    <p className="font-mono font-medium">{selectedDelivery.tracking_number}</p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default DriverDashboard;
