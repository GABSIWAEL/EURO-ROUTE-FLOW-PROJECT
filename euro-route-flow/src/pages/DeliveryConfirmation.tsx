import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deliveryRequestApi } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface DeliveryRequest {
    id: string;
    trackingNumber: string | null;
    clientName: string;
    clientPhone: string;
    deliveryAddress: string;
    status: string;
}

export default function DeliveryConfirmation() {
    const { trackingNumber } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);

    useEffect(() => {
        const confirmDelivery = async () => {
            if (!trackingNumber) {
                setError("Tracking number not found");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await deliveryRequestApi.confirmDelivery(trackingNumber);
                setDelivery(response as unknown as DeliveryRequest);
                setIsSuccess(true);
            } catch (err) {
                //console.error("Error confirming delivery:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to confirm delivery. Please try again."
                );
            } finally {
                setIsLoading(false);
            }
        };

        confirmDelivery();
    }, [trackingNumber]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800">Confirmation en cours...</h2>
                    <p className="text-gray-600 mt-2">Veuillez patienter</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button
                        onClick={() => navigate("/admin")}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        Retour au tableau de bord
                    </Button>
                </div>
            </div>
        );
    }

    if (isSuccess && delivery) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-800 mb-2">✓ Livraison confirmée!</h2>
                    <div className="bg-gray-50 rounded-lg p-4 my-6 text-left">
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">Numéro de suivi</p>
                            <p className="font-mono font-bold text-lg text-blue-600">{delivery.trackingNumber}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">Client</p>
                            <p className="font-semibold text-gray-800">{delivery.clientName}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">Téléphone</p>
                            <p className="font-semibold text-gray-800">{delivery.clientPhone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Adresse de livraison</p>
                            <p className="font-semibold text-gray-800">{delivery.deliveryAddress}</p>
                        </div>
                    </div>
                    <p className="text-green-700 font-semibold mb-6">
                        La livraison a été marquée comme complétée à {new Date().toLocaleTimeString("fr-FR")}
                    </p>
                    <Button
                        onClick={() => navigate("/admin")}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        Retour au tableau de bord
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}
