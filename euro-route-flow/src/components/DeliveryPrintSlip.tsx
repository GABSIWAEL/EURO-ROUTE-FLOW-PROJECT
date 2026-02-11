import { useRef } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface DeliveryRequest {
    id: string;
    trackingNumber: string | null;
    clientName: string;
    clientEmail: string | null;
    clientPhone: string;
    pickupAddress: string;
    deliveryAddress: string;
    itemType: string;
    itemWeight: string | null;
    itemSize: string | null;
    status: string;
    requestedDate: string;
    requestedTime: string | null;
    clientNotes: string | null;
    assignedDriverId: string | null;
    driverName?: string;
    createdAt?: string;
}

interface DeliveryPrintSlipProps {
    delivery: DeliveryRequest;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatTime = (timeString: string | null) => {
    if (!timeString) return "Non spécifiée";
    return timeString;
};

const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
        EN_ATTENTE: "En attente",
        EN_COURS: "En transit",
        LIVRE: "Livré",
    };
    return statusMap[status] || status;
};

const getStatusColor = (status: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
        EN_ATTENTE: { bg: "#FFF9E6", text: "#B8860B" },
        EN_COURS: { bg: "#E3F2FD", text: "#1565C0" },
        LIVRE: { bg: "#E8F5E9", text: "#2E7D32" },
    };
    return colors[status] || { bg: "#F5F5F5", text: "#424242" };
};

export function DeliveryPrintSlip({ delivery }: DeliveryPrintSlipProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (printRef.current) {
            const printWindow = window.open("", "", "height=900,width=950");
            if (printWindow) {
                printWindow.document.write(printRef.current.innerHTML);
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    // Generate QR code content with URL to confirm delivery - scan this to mark as delivered
    const qrContent = `${window.location.origin}/delivery-confirmation/${delivery.trackingNumber}`;

    const statusColor = getStatusColor(delivery.status);

    return (
        <div className="space-y-4">
            {/* Print Button */}
            <Button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
                <Printer className="w-4 h-4" />
                Imprimer le bordereau de livraison
            </Button>

            {/* Hidden Print Content */}
            <div
                ref={printRef}
                style={{ display: "none" }}
            >
                <style>{`
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Arial', 'Helvetica', sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    
                    @media print {
                        body {
                            margin: 0;
                            padding: 0;
                            background: white;
                        }
                        
                        .print-container {
                            width: 210mm;
                            height: 297mm;
                            margin: 0 auto;
                            padding: 15mm;
                            background: white;
                            box-shadow: 0 0 0 1px #000;
                            page-break-after: always;
                            display: flex;
                            flex-direction: column;
                        }
                        
                        .header-section {
                            display: grid;
                            grid-template-columns: 1fr 2fr 1fr;
                            gap: 15px;
                            align-items: center;
                            margin-bottom: 20px;
                            padding-bottom: 15px;
                            border-bottom: 3px solid #1565C0;
                        }
                        
                        .company-logo {
                            text-align: center;
                        }
                        
                        .company-logo-circle {
                            width: 60px;
                            height: 60px;
                            background: linear-gradient(135deg, #1565C0 0%, #42A5F5 100%);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto;
                            font-weight: bold;
                            color: white;
                            font-size: 14px;
                        }
                        
                        .company-info {
                            text-align: center;
                            padding: 0 10px;
                        }
                        
                        .company-name {
                            font-size: 20px;
                            font-weight: bold;
                            color: #1565C0;
                            margin-bottom: 2px;
                            letter-spacing: 1px;
                        }
                        
                        .company-tagline {
                            font-size: 10px;
                            color: #666;
                            font-style: italic;
                        }
                        
                        .document-type {
                            text-align: right;
                            font-size: 11px;
                        }
                        
                        .document-type-label {
                            font-size: 13px;
                            font-weight: bold;
                            background: #E3F2FD;
                            padding: 3px 8px;
                            border-radius: 3px;
                            border: 1px solid #1565C0;
                        }
                        
                        .tracking-box {
                            background: linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%);
                            border: 2px solid #1565C0;
                            border-radius: 5px;
                            padding: 12px;
                            margin-bottom: 15px;
                            text-align: center;
                        }
                        
                        .tracking-label {
                            font-size: 10px;
                            color: #666;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-bottom: 5px;
                        }
                        
                        .tracking-number {
                            font-size: 20px;
                            font-weight: bold;
                            color: #1565C0;
                            letter-spacing: 2px;
                            font-family: 'Courier New', monospace;
                        }
                        
                        .content-section {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 12px;
                            margin-bottom: 15px;
                        }
                        
                        .info-box {
                            border: 1px solid #BDBDBD;
                            border-radius: 4px;
                            padding: 12px;
                            background: #FAFAFA;
                        }
                        
                        .info-box-header {
                            background: linear-gradient(90deg, #1565C0, #42A5F5);
                            color: white;
                            padding: 8px 10px;
                            margin: -12px -12px 10px -12px;
                            border-radius: 3px 3px 0 0;
                            font-size: 11px;
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        
                        .info-row {
                            margin-bottom: 8px;
                            font-size: 11px;
                            line-height: 1.4;
                        }
                        
                        .info-label {
                            font-weight: bold;
                            color: #1565C0;
                            display: inline-block;
                            width: 90px;
                        }
                        
                        .info-value {
                            color: #333;
                            word-break: break-word;
                        }
                        
                        .details-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr 1fr;
                            gap: 10px;
                            margin-bottom: 15px;
                        }
                        
                        .detail-box {
                            border: 1px solid #BDBDBD;
                            border-radius: 4px;
                            padding: 10px;
                            background: #FAFAFA;
                        }
                        
                        .detail-label {
                            font-size: 9px;
                            font-weight: bold;
                            color: #666;
                            text-transform: uppercase;
                            margin-bottom: 4px;
                            letter-spacing: 0.5px;
                        }
                        
                        .detail-value {
                            font-size: 12px;
                            font-weight: bold;
                            color: #1565C0;
                        }
                        
                        .status-box {
                            background: ${statusColor.bg};
                            border: 2px solid ${statusColor.text};
                            border-radius: 4px;
                            padding: 10px;
                            text-align: center;
                            margin-bottom: 15px;
                        }
                        
                        .status-label {
                            font-size: 9px;
                            color: #666;
                            text-transform: uppercase;
                            margin-bottom: 4px;
                            letter-spacing: 0.5px;
                        }
                        
                        .status-value {
                            font-size: 14px;
                            font-weight: bold;
                            color: ${statusColor.text};
                        }
                        
                        .qr-section {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            border: 2px solid #BDBDBD;
                            border-radius: 4px;
                            padding: 15px;
                            background: #FAFAFA;
                            margin-bottom: 15px;
                        }
                        
                        .qr-label {
                            font-size: 9px;
                            color: #666;
                            text-transform: uppercase;
                            margin-bottom: 8px;
                            letter-spacing: 0.5px;
                            font-weight: bold;
                        }
                        
                        .qr-code {
                            border: 2px solid #1565C0;
                            padding: 5px;
                            background: white;
                        }
                        
                        .qr-instructions {
                            font-size: 9px;
                            color: #666;
                            margin-top: 8px;
                            text-align: center;
                            font-style: italic;
                        }
                        
                        .notes-section {
                            border: 1px solid #BDBDBD;
                            border-radius: 4px;
                            padding: 10px;
                            background: #FAFAFA;
                            margin-bottom: 15px;
                            min-height: 50px;
                        }
                        
                        .notes-header {
                            font-size: 10px;
                            font-weight: bold;
                            color: #1565C0;
                            margin-bottom: 5px;
                            text-transform: uppercase;
                        }
                        
                        .notes-content {
                            font-size: 11px;
                            color: #333;
                            line-height: 1.4;
                        }
                        
                        .signature-section {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 20px;
                            margin-bottom: 15px;
                        }
                        
                        .signature-box {
                            border-top: 1px solid #333;
                            padding-top: 8px;
                            text-align: center;
                            font-size: 10px;
                        }
                        
                        .footer-section {
                            border-top: 2px solid #1565C0;
                            padding-top: 10px;
                            margin-top: auto;
                            text-align: center;
                            font-size: 9px;
                            color: #666;
                        }
                        
                        .footer-row {
                            margin-bottom: 3px;
                        }
                        
                        .footer-company {
                            font-weight: bold;
                            color: #1565C0;
                            margin-bottom: 5px;
                        }
                        
                        .divider {
                            height: 1px;
                            background: #BDBDBD;
                            margin: 10px 0;
                        }
                    }
                `}</style>

                <div className="print-container">
                    {/* Header */}
                    <div className="header-section">
                        <div className="company-logo">
                            <div className="company-logo-circle">ER</div>
                        </div>
                        <div className="company-info">
                            <div className="company-name">EURO ROUTE</div>
                            <div className="company-tagline">Livraison Express - Fiable & Rapide</div>
                        </div>
                        <div className="document-type">
                            <div className="document-type-label">BORDEREAU</div>
                        </div>
                    </div>

                    {/* Tracking Box */}
                    <div className="tracking-box">
                        <div className="tracking-label">Numéro de suivi</div>
                        <div className="tracking-number">{delivery.trackingNumber || "N/A"}</div>
                    </div>

                    {/* Main Content */}
                    <div className="content-section">
                        {/* Pickup Info */}
                        <div className="info-box">
                            <div className="info-box-header">📦 Point d'enlèvement</div>
                            <div className="info-row">
                                <span className="info-label">Adresse:</span>
                                <span className="info-value">{delivery.pickupAddress}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Type:</span>
                                <span className="info-value">{delivery.itemType}</span>
                            </div>
                            {delivery.itemWeight && (
                                <div className="info-row">
                                    <span className="info-label">Poids:</span>
                                    <span className="info-value">{delivery.itemWeight}</span>
                                </div>
                            )}
                            {delivery.itemSize && (
                                <div className="info-row">
                                    <span className="info-label">Dimensions:</span>
                                    <span className="info-value">{delivery.itemSize}</span>
                                </div>
                            )}
                        </div>

                        {/* Delivery Info */}
                        <div className="info-box">
                            <div className="info-box-header">📍 Destination</div>
                            <div className="info-row">
                                <span className="info-label">Client:</span>
                                <span className="info-value">{delivery.clientName}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Téléphone:</span>
                                <span className="info-value">{delivery.clientPhone}</span>
                            </div>
                            {delivery.clientEmail && (
                                <div className="info-row">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{delivery.clientEmail}</span>
                                </div>
                            )}
                            <div className="info-row">
                                <span className="info-label">Adresse:</span>
                                <span className="info-value">{delivery.deliveryAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="details-grid">
                        <div className="detail-box">
                            <div className="detail-label">📅 Date demandée</div>
                            <div className="detail-value">{formatDate(delivery.requestedDate)}</div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-label">⏰ Heure</div>
                            <div className="detail-value">{formatTime(delivery.requestedTime)}</div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-label">🚚 Chauffeur</div>
                            <div className="detail-value">{delivery.driverName || "À assigner"}</div>
                        </div>
                    </div>

                    {/* Status Box */}
                    <div className="status-box">
                        <div className="status-label">Statut de livraison</div>
                        <div className="status-value">{formatStatus(delivery.status)}</div>
                    </div>

                    {/* QR Code Section */}
                    <div className="qr-section">
                        <div className="qr-label">Code à barres 2D</div>
                        <div className="qr-code">
                            <QRCode
                                value={qrContent}
                                size={120}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <div className="qr-instructions">Scannez le code pour voir les détails et le statut</div>
                    </div>

                    {/* Notes Section */}
                    {delivery.clientNotes && (
                        <div className="notes-section">
                            <div className="notes-header">📝 Instructions spéciales</div>
                            <div className="notes-content">{delivery.clientNotes}</div>
                        </div>
                    )}

                    {/* Signature Section */}
                    <div className="signature-section">
                        <div className="signature-box">
                            <strong>Signature client</strong>
                            <div style={{ marginTop: "20px", height: "30px" }}></div>
                        </div>
                        <div className="signature-box">
                            <strong>Signature chauffeur</strong>
                            <div style={{ marginTop: "20px", height: "30px" }}></div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="footer-section">
                        <div className="footer-company">EURO ROUTE - Livraison Express</div>
                        <div className="footer-row">📞 +33 1 XX XX XX XX | 📧 support@euroroute.com | 🌐 www.euroroute.com</div>
                        <div className="divider"></div>
                        <div className="footer-row">Ce bordereau doit accompagner la livraison. Conservez votre copie.</div>
                        <div className="footer-row">Impression: {formatDate(new Date().toISOString())}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
