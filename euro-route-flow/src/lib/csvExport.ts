/**
 * Excel Export Utility
 * Generates colored Excel files with proper formatting
 */

import ExcelJS from 'exceljs';

// Color map for delivery statuses
const statusColors = {
    "EN_ATTENTE": "FFF3CD", // Yellow
    "En attente": "FFF3CD",
    "EN_COURS": "CCE5FF",   // Blue
    "En transit": "CCE5FF",
    "LIVRE": "D4EDDA",      // Green
    "Livré": "D4EDDA",
};

const statusTextColors = {
    "EN_ATTENTE": "856404",
    "En attente": "856404",
    "EN_COURS": "004085",
    "En transit": "004085",
    "LIVRE": "155724",
    "Livré": "155724",
};

// Helper function to generate Excel file
async function generateExcelFile(
    data: any[],
    filename: string,
    columns: string[],
    columnLabels: { [key: string]: string },
    statusColumnIndex?: number
) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    // Add headers
    const headerRow = worksheet.addRow(columns.map(col => columnLabels[col] || col));

    // Style headers
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
    headerRow.alignment = { horizontal: "center", vertical: "center", wrapText: true };

    // Add data rows
    data.forEach((row, rowIndex) => {
        const values = columns.map(col => row[col]);
        const excelRow = worksheet.addRow(values);

        // Apply colors based on status if specified
        if (statusColumnIndex !== undefined) {
            const statusValue = values[statusColumnIndex];
            if (statusValue && statusColors[statusValue as keyof typeof statusColors]) {
                excelRow.eachCell((cell) => {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: statusColors[statusValue as keyof typeof statusColors] },
                    };
                    cell.font = {
                        color: { argb: statusTextColors[statusValue as keyof typeof statusTextColors] },
                    };
                });
            }
        }

        // Set alignment
        excelRow.alignment = { vertical: "center", wrapText: true };
    });

    // Auto-fit columns
    columns.forEach((col, index) => {
        const column = worksheet.columns[index];
        if (column) {
            let maxLength = columnLabels[col]?.length || 0;
            data.forEach(row => {
                const cellLength = String(row[col] || "").length;
                maxLength = Math.max(maxLength, cellLength);
            });
            column.width = Math.min(maxLength + 2, 50);
        }
    });

    // Generate file and download
    const buffer = await workbook.xlsx.writeBuffer();
    downloadExcel(buffer, filename);
}

function downloadExcel(buffer: any, filename: string) {
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Export drivers to Excel
export async function exportDriversToExcel(drivers: any[]) {
    const columns = ["id", "fullName", "email", "phone", "isActive", "createdAt"];

    const columnLabels = {
        id: "ID",
        fullName: "Nom Complet",
        email: "Email",
        phone: "Téléphone",
        isActive: "Statut",
        createdAt: "Date d'ajout",
    };

    const formattedData = drivers.map(driver => ({
        id: driver.id,
        fullName: driver.fullName,
        email: driver.email || "N/A",
        phone: driver.phone,
        isActive: driver.isActive === true || driver.isActive === "true" ? "Actif" : "Inactif",
        createdAt: new Date(driver.createdAt).toLocaleDateString("fr-FR"),
    }));

    await generateExcelFile(formattedData, "chauffeurs", columns, columnLabels, 4);
}

// Export deliveries to Excel with status colors and driver names
export async function exportDeliveriesToExcel(deliveries: any[], drivers?: any[]) {
    // Build driver name map
    const driverMap: { [key: string]: string } = {};
    if (drivers) {
        drivers.forEach(driver => {
            driverMap[driver.id] = driver.fullName;
        });
    }

    const columns = [
        "trackingNumber",
        "clientName",
        "clientPhone",
        "pickupAddress",
        "deliveryAddress",
        "itemType",
        "status",
        "requestedDate",
        "assignedDriverId",
        "createdAt",
    ];

    const columnLabels = {
        trackingNumber: "N° Suivi",
        clientName: "Nom du Client",
        clientPhone: "Téléphone Client",
        pickupAddress: "Adresse Enlèvement",
        deliveryAddress: "Adresse Livraison",
        itemType: "Type d'Article",
        status: "Statut",
        requestedDate: "Date Demandée",
        assignedDriverId: "Chauffeur",
        createdAt: "Date Création",
    };

    const formattedData = deliveries.map(delivery => ({
        trackingNumber: delivery.trackingNumber || "N/A",
        clientName: delivery.clientName,
        clientPhone: delivery.clientPhone,
        pickupAddress: delivery.pickupAddress,
        deliveryAddress: delivery.deliveryAddress,
        itemType: delivery.itemType,
        status: formatDeliveryStatus(delivery.status),
        requestedDate: new Date(delivery.requestedDate).toLocaleDateString("fr-FR"),
        assignedDriverId: delivery.assignedDriverId
            ? (driverMap[delivery.assignedDriverId] || "Non assigné")
            : "Non assigné",
        createdAt: new Date(delivery.createdAt).toLocaleDateString("fr-FR"),
    }));

    // Status is at index 6
    await generateExcelFile(formattedData, "demandes-livraison", columns, columnLabels, 6);
}

// Export messages to Excel
export async function exportMessagesToExcel(messages: any[]) {
    const columns = [
        "name",
        "email",
        "phone",
        "subject",
        "message",
        "isRead",
        "response",
        "createdAt",
    ];

    const columnLabels = {
        name: "Nom",
        email: "Email",
        phone: "Téléphone",
        subject: "Sujet",
        message: "Message",
        isRead: "Statut Lecture",
        response: "Réponse",
        createdAt: "Date",
    };

    const formattedData = messages.map(message => ({
        name: message.name,
        email: message.email,
        phone: message.phone,
        subject: message.subject,
        message: message.message,
        isRead: message.isRead ? "Lu" : "Nouveau",
        response: message.response || "Pas de réponse",
        createdAt: new Date(message.createdAt).toLocaleDateString("fr-FR"),
    }));

    await generateExcelFile(formattedData, "messages-contact", columns, columnLabels);
}

function formatDeliveryStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
        EN_ATTENTE: "En attente",
        EN_COURS: "En transit",
        LIVRE: "Livré",
    };
    return statusMap[status] || status;
}
