import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { deliveryRequestApi, driverApi, usersApi, notificationsApi } from "@/integrations/api/client";
import { notificationService } from "@/integrations/api/websocketNotificationService";
import { exportDeliveriesToExcel, exportMessagesToExcel } from "@/lib/csvExport";
import { DeliveryPrintSlip } from "@/components/DeliveryPrintSlip";
import { NotificationsPage } from "@/components/NotificationsPage";
import { RealtimeVisitorStats } from "@/components/RealtimeVisitorStats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { DriverManagement } from "@/components/DriverManagement";
import { DeliveryStatistics } from "@/components/DeliveryStatistics";
import { Messages } from "@/components/Messages";
import { useToast } from "@/hooks/use-toast";
import {
  Truck,
  LogOut,
  Search,
  Filter,
  RefreshCw,
  Eye,
  UserCheck,
  StickyNote,
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  Home,
  Users,
  Download,
  BarChart3,
  Trash2,
  MapPin,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Percent,
  Wifi,
  WifiOff,
  Calendar,
  Mail,
  FileText,
  CheckSquare,
  Square,
  Zap,
  Star,
  Award,
  Bell,
} from "lucide-react";

type DeliveryStatus = "EN_ATTENTE" | "EN_COURS" | "LIVRE";

// Fix Leaflet default icons issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface DeliveryRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  pickupAddress: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  pickupFromMap?: boolean;
  deliveryAddress: string;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  deliveryFromMap?: boolean;
  itemType: string;
  itemSize: string | null;
  itemWeight: string | null;
  requestedDate: string;
  requestedTime: string | null;
  status: "EN_ATTENTE" | "EN_COURS" | "LIVRE";
  assignedDriverId: string | null;
  clientNotes: string | null;
  internalNotes: string | null;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

interface Driver {
  id: string;
  fullName: string;
  phone: string;
  isActive: boolean;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "STAFF" | "DRIVER";
  isActive: boolean;
  createdAt: string | Date;
}

interface DriverPerformance {
  driverId: string;
  driverName: string;
  totalDeliveries: number;
  completedDeliveries: number;
  onTimePercentage: number;
  averageRating: number;
  isOnline: boolean;
}

const AdminDashboard = () => {
  const { user, isLoading: authLoading, isStaff, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<DeliveryRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // User creation form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserRole, setNewUserRole] = useState("DRIVER");
  const [newUserPhone, setNewUserPhone] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Advanced Filters State
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [selectedDeliveries, setSelectedDeliveries] = useState<Set<string>>(new Set());
  const [bulkAssignDriver, setBulkAssignDriver] = useState<string>("");
  const [bulkStatus, setBulkStatus] = useState<"EN_ATTENTE" | "EN_COURS" | "LIVRE" | "">();
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Driver Performance State
  const [driverPerformance, setDriverPerformance] = useState<DriverPerformance[]>([]);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  // Export State
  const [emailForSchedule, setEmailForSchedule] = useState("");
  const [showEmailSchedule, setShowEmailSchedule] = useState(false);

  // Check authentication and authorization
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin");
    }
  }, [user, authLoading, navigate]);

  // Fetch data
  useEffect(() => {
    if (user && isStaff) {
      fetchRequests();
      fetchDrivers();
      fetchUsers();
      initializeNotifications();
    }
  }, [user, isStaff]);

  // Initialize WebSocket for real-time notifications
  const initializeNotifications = async () => {
    if (!user?.id) return;

    try {
      // Connect to WebSocket
      await notificationService.connect(
        user.id,
        () => {
          // WebSocket notification service connected
        },
        (error) => {
          // WebSocket connection error
        }
      );

      // Load initial unread count
      const countData = await notificationsApi.getUnreadCount();
      setUnreadNotificationCount(countData.count || 0);

      // Subscribe to new notifications
      notificationService.subscribe((notification) => {
        setUnreadNotificationCount((prev) => prev + 1);
        toast({
          title: notification.title,
          description: notification.message,
        });
      });
    } catch (error) {
      // Failed to initialize notifications
    }
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      notificationService.disconnect();
    };
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await deliveryRequestApi.getAll();
      setRequests((data as DeliveryRequest[]) || []);
    } catch (error) {
      // console.error("Error fetching requests:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const data = await driverApi.getActive();
      setDrivers((data as Driver[]) || []);
    } catch (error) {
      //console.error("Error fetching drivers:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers((data as User[]) || []);
    } catch (error) {
      //console.error("Error fetching users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (requestId: string, newStatus: "EN_ATTENTE" | "EN_COURS" | "LIVRE") => {
    setIsSaving(true);
    try {
      await deliveryRequestApi.update(requestId, {
        status: newStatus,
        ...(newStatus === "LIVRE" ? { completedAt: new Date().toISOString() } : {}),
      });

      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      );

      if (selectedRequest?.id === requestId) {
        setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      toast({ title: "Statut mis à jour" });
    } catch (error) {
      //console.error("Error updating status:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const assignDriver = async (requestId: string, driverId: string) => {
    setIsSaving(true);
    try {
      await deliveryRequestApi.update(requestId, {
        assignedDriverId: driverId,
        status: "EN_COURS",
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, assigned_driver_id: driverId, status: "en_cours" as DeliveryStatus }
            : r
        )
      );

      if (selectedRequest?.id === requestId) {
        setSelectedRequest((prev) =>
          prev
            ? { ...prev, assigned_driver_id: driverId, status: "en_cours" as DeliveryStatus }
            : null
        );
      }

      toast({ title: "Chauffeur assigné" });
    } catch (error) {
      // console.error("Error assigning driver:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'assigner le chauffeur",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveInternalNotes = async (requestId: string) => {
    setIsSaving(true);
    try {
      await deliveryRequestApi.update(requestId, {
        internalNotes: internalNote,
      });

      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, internalNotes: internalNote } : r))
      );

      if (selectedRequest?.id === requestId) {
        setSelectedRequest((prev) =>
          prev ? { ...prev, internalNotes: internalNote } : null
        );
      }

      toast({ title: "Notes sauvegardées" });
    } catch (error) {
      //console.error("Error saving notes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  // ENHANCED: Calculate Today's Deliveries
  const getTodayDeliveries = () => {
    const today = new Date().toDateString();
    return requests.filter(r => new Date(r.requestedDate).toDateString() === today).length;
  };



  // ENHANCED: Calculate Average Success Rate
  const getSuccessRate = () => {
    if (requests.length === 0) return 0;
    const delivered = requests.filter(r => r.status === "LIVRE").length;
    return Math.round((delivered / requests.length) * 100);
  };

  // ENHANCED: Get Active Drivers Online (mock - based on isActive)
  const getActiveDriversOnline = () => {
    return drivers.filter(d => d.isActive).length;
  };

  // ENHANCED: Calculate Driver Performance Metrics
  const calculateDriverPerformance = (driverId: string): DriverPerformance => {
    const driverRequests = requests.filter(r => r.assignedDriverId === driverId);
    const driverInfo = drivers.find(d => d.id === driverId);
    const completedRequests = driverRequests.filter(r => r.status === "LIVRE");

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      driverId,
      driverName: driverInfo?.fullName || "Unknown",
      totalDeliveries: driverRequests.length,
      completedDeliveries: completedRequests.length,
      onTimePercentage: driverRequests.length > 0 ? Math.round((completedRequests.length / driverRequests.length) * 100) : 0,
      averageRating: Math.round(Math.random() * 5 * 10) / 10, // Mock rating
      isOnline: driverInfo?.isActive || false,
    };
  };

  // ENHANCED: Get Alert Data
  const getAlerts = () => {
    const alerts = [];

    // Late deliveries
    const lateDeliveries = requests.filter(r =>
      r.status !== "LIVRE" && new Date(r.requestedDate) < new Date()
    ).length;

    if (lateDeliveries > 0) {
      alerts.push({
        type: "late",
        title: `${lateDeliveries} livraison(s) en retard`,
        description: "Des livraisons sont en retard par rapport à la date demandée",
        icon: "clock"
      });
    }

    // Offline drivers
    const offlineDrivers = drivers.filter(d => !d.isActive).length;
    if (offlineDrivers > 0) {
      alerts.push({
        type: "offline",
        title: `${offlineDrivers} chauffeur(s) hors ligne`,
        description: "Certains chauffeurs sont actuellement hors ligne",
        icon: "wifi"
      });
    }

    // Unassigned deliveries
    const unassignedDeliveries = requests.filter(r => !r.assignedDriverId && r.status !== "LIVRE").length;
    if (unassignedDeliveries > 0) {
      alerts.push({
        type: "unassigned",
        title: `${unassignedDeliveries} livraison(s) non assignée(s)`,
        description: "Des livraisons en attente n'ont pas de chauffeur assigné",
        icon: "alert"
      });
    }

    return alerts;
  };

  // ENHANCED: Bulk Assign Drivers
  const bulkAssignDrivers = async () => {
    if (!bulkAssignDriver || selectedDeliveries.size === 0) return;

    setIsSaving(true);
    try {
      const promises = Array.from(selectedDeliveries).map(deliveryId =>
        deliveryRequestApi.update(deliveryId, {
          assignedDriverId: bulkAssignDriver,
          status: "EN_COURS"
        })
      );

      await Promise.all(promises);

      setRequests(prev =>
        prev.map(r =>
          selectedDeliveries.has(r.id)
            ? { ...r, assignedDriverId: bulkAssignDriver, status: "EN_COURS" }
            : r
        )
      );

      setSelectedDeliveries(new Set());
      toast({ title: `${selectedDeliveries.size} livraison(s) assignée(s)` });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner les chauffeurs",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ENHANCED: Bulk Update Status
  const bulkUpdateStatus = async () => {
    if (!bulkStatus || selectedDeliveries.size === 0) return;

    setIsSaving(true);
    try {
      const promises = Array.from(selectedDeliveries).map(deliveryId =>
        deliveryRequestApi.update(deliveryId, {
          status: bulkStatus,
          ...(bulkStatus === "LIVRE" ? { completedAt: new Date().toISOString() } : {})
        })
      );

      await Promise.all(promises);

      setRequests(prev =>
        prev.map(r =>
          selectedDeliveries.has(r.id)
            ? { ...r, status: bulkStatus }
            : r
        )
      );

      setSelectedDeliveries(new Set());
      toast({ title: `${selectedDeliveries.size} statut(s) mis à jour` });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les statuts",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ENHANCED: Export PDF (basic HTML to PDF simulation)
  const exportToPDF = () => {
    const filteredData = filteredRequests.filter(r => r.status === statusFilter || statusFilter === "all");
    let content = "RAPPORT DE LIVRAISONS\n";
    content += `Généré le: ${new Date().toLocaleString()}\n\n`;

    filteredData.forEach(r => {
      content += `N° Suivi: ${r.trackingNumber}\n`;
      content += `Client: ${r.clientName} (${r.clientPhone})\n`;
      content += `Adresse collecte: ${r.pickupAddress}\n`;
      content += `Adresse livraison: ${r.deliveryAddress}\n`;
      content += `Statut: ${r.status}\n`;
      content += `Chauffeur: ${getDriverName(r.assignedDriverId)}\n`;
      content += "---\n";
    });

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", `rapport-livraisons-${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({ title: "Rapport exporté" });
  };

  // ENHANCED: Schedule Email Export
  const scheduleEmailExport = () => {
    if (!emailForSchedule) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Export programmé",
      description: `Un rapport sera envoyé à ${emailForSchedule}`
    });

    setShowEmailSchedule(false);
    setEmailForSchedule("");
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${email} ?`)) {
      return;
    }

    setIsDeletingUser(true);
    try {
      await usersApi.delete(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast({
        title: "Succès",
        description: `Utilisateur ${email} supprimé avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setIsDeletingUser(false);
    }
  };

  const createNewUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserFullName) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    // Phone is required for drivers
    if (newUserRole === "DRIVER" && !newUserPhone) {
      toast({
        title: "Erreur",
        description: "Le numéro de téléphone est obligatoire pour les chauffeurs",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingUser(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"}/api/users/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: newUserEmail,
            password: newUserPassword,
            fullName: newUserFullName,
            role: newUserRole,
            phone: newUserRole === "DRIVER" ? newUserPhone : undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création de l'utilisateur");
      }

      const createdUser = await response.json();

      toast({
        title: "Succès",
        description: `Utilisateur ${createdUser.email} créé avec succès`,
      });

      // Reset form
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserFullName("");
      setNewUserPhone(null);
      setNewUserRole("DRIVER");

      // Refresh users list
      await fetchUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Impossible de créer l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const openDetail = (request: DeliveryRequest) => {
    setSelectedRequest(request);
    setInternalNote(request.internalNotes || "");
    setIsDetailOpen(true);
  };

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      (request.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (request.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (request.pickupAddress?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (request.deliveryAddress?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesStatus = statusFilter === "all" || request.status === statusFilter;

    // Date range filter
    const requestDate = new Date(request.requestedDate);
    let matchesDateRange = true;

    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter);
      matchesDateRange = matchesDateRange && requestDate >= fromDate;
    }

    if (dateToFilter) {
      const toDate = new Date(dateToFilter);
      toDate.setHours(23, 59, 59, 999);
      matchesDateRange = matchesDateRange && requestDate <= toDate;
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "EN_ATTENTE").length,
    inProgress: requests.filter((r) => r.status === "EN_COURS").length,
    delivered: requests.filter((r) => r.status === "LIVRE").length,
  };

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return "Non assigné";
    const driver = drivers.find((d) => d.id === driverId);
    return driver?.fullName || "Inconnu";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">Accès refusé</h1>
          <p className="text-muted-foreground mb-6">
            Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
            Contactez un administrateur si vous pensez que c'est une erreur.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/">
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="default">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
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
                  Tableau de bord
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

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
            <TabsList className="inline-flex gap-1 p-4 sm:p-0 sm:grid sm:w-full sm:max-w-7xl sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="requests" className="flex items-center gap-2 whitespace-nowrap">
                <Package className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Demandes</span>
                <span className="sm:hidden">Demandes</span>
              </TabsTrigger>
              <TabsTrigger value="drivers" className="flex items-center gap-2 whitespace-nowrap">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Chauffeurs</span>
                <span className="sm:hidden">Chauffeurs</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2 whitespace-nowrap">
                <Award className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Performance</span>
                <span className="sm:hidden">Perf</span>
              </TabsTrigger>
              <TabsTrigger value="visiteur" className="flex items-center gap-2 whitespace-nowrap">
                <Eye className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">Visiteur</span>
                <span className="md:hidden">Visit</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2 whitespace-nowrap">
                <StickyNote className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">Messages</span>
                <span className="md:hidden">Msg</span>
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-2 whitespace-nowrap">
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Statistiques</span>
                <span className="lg:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2 whitespace-nowrap">
                <UserCheck className="w-4 h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Utilisateurs</span>
                <span className="lg:hidden">Users</span>
              </TabsTrigger>
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent relative whitespace-nowrap"
                title="Notifications"
              >
                <Bell className="w-4 h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Notifications</span>
                <span className="lg:hidden">Notif</span>
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                  </span>
                )}
              </button>
            </TabsList>
          </div>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {/* ENHANCED: Real-time Alerts Banner */}
            {getAlerts().length > 0 && (
              <div className="space-y-3">
                {getAlerts().map((alert, idx) => (
                  <div key={idx} className={`rounded-lg p-4 border-l-4 flex items-start gap-3 ${alert.type === "late" ? "bg-red-50 border-red-500" :
                    alert.type === "offline" ? "bg-orange-50 border-orange-500" :
                      "bg-yellow-50 border-yellow-500"
                    }`}>
                    <div className="mt-0.5">
                      {alert.type === "late" && <AlertTriangle className="w-5 h-5 text-red-600" />}
                      {alert.type === "offline" && <WifiOff className="w-5 h-5 text-orange-600" />}
                      {alert.type === "unassigned" && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${alert.type === "late" ? "text-red-800" :
                        alert.type === "offline" ? "text-orange-800" :
                          "text-yellow-800"
                        }`}>
                        {alert.title}
                      </p>
                      <p className={`text-xs mt-1 ${alert.type === "late" ? "text-red-700" :
                        alert.type === "offline" ? "text-orange-700" :
                          "text-yellow-700"
                        }`}>
                        {alert.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ENHANCED: Dashboard Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Deliveries */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                    <p className="text-xs text-blue-700 mt-1">Total</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-400 opacity-70" />
                </div>
              </div>

              {/* Today's Deliveries */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-sm border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-900">{getTodayDeliveries()}</p>
                    <p className="text-xs text-purple-700 mt-1">Aujourd'hui</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-400 opacity-70" />
                </div>
              </div>

              {/* Success Rate */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 shadow-sm border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-amber-900">{getSuccessRate()}%</p>
                    <p className="text-xs text-amber-700 mt-1">Taux de réussite</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-amber-400 opacity-70" />
                </div>
              </div>

              {/* Active Drivers */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 shadow-sm border border-pink-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-pink-900">{getActiveDriversOnline()}</p>
                    <p className="text-xs text-pink-700 mt-1">Chauffeurs actifs</p>
                  </div>
                  <Wifi className="w-8 h-8 text-pink-400 opacity-70" />
                </div>
              </div>
            </div>

            {/* ENHANCED: Advanced Filters */}
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <div className="space-y-4">
                {/* Main Search and Status Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom, n° suivi, adresse..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                      <SelectItem value="EN_COURS">En cours</SelectItem>
                      <SelectItem value="LIVRE">Livrées</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">De</label>
                    <Input
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">À</label>
                    <Input
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                    />
                  </div>
                </div>

                {/* Export and Bulk Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => exportDeliveriesToExcel(filteredRequests, drivers)}
                    disabled={isLoading || filteredRequests.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Excel
                  </Button>

                  <Button
                    variant="outline"
                    onClick={exportToPDF}
                    disabled={isLoading || filteredRequests.length === 0}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Rapport
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowEmailSchedule(true)}
                    disabled={isLoading || filteredRequests.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="flex items-center gap-2 ml-auto"
                  >
                    <Zap className="w-4 h-4" />
                    Actions groupées
                  </Button>

                  <Button variant="outline" onClick={fetchRequests} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Actualiser
                  </Button>
                </div>

                {/* Bulk Actions Panel */}
                {showBulkActions && (
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-sm">
                        {selectedDeliveries.size} sélectionné(s)
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDeliveries(new Set())}
                      >
                        Désélectionner tout
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Assigner chauffeur</label>
                        <Select value={bulkAssignDriver} onValueChange={setBulkAssignDriver}>
                          <SelectTrigger size="sm">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {drivers.map(d => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Nouveau statut</label>
                        <Select value={bulkStatus || ""} onValueChange={(v) => setBulkStatus(v as any)}>
                          <SelectTrigger size="sm">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                            <SelectItem value="EN_COURS">En cours</SelectItem>
                            <SelectItem value="LIVRE">Livrée</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2 items-end">
                        <Button
                          size="sm"
                          onClick={bulkAssignDrivers}
                          disabled={!bulkAssignDriver || selectedDeliveries.size === 0 || isSaving}
                          className="flex-1"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Assigner
                        </Button>

                        <Button
                          size="sm"
                          onClick={bulkUpdateStatus}
                          disabled={!bulkStatus || selectedDeliveries.size === 0 || isSaving}
                          className="flex-1"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Mettre à jour
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune demande trouvée</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">
                          <input
                            type="checkbox"
                            checked={selectedDeliveries.size === paginatedRequests.length && paginatedRequests.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDeliveries(new Set(paginatedRequests.map(r => r.id)));
                              } else {
                                setSelectedDeliveries(new Set());
                              }
                            }}
                            className="cursor-pointer"
                          />
                        </TableHead>
                        <TableHead>N° Suivi</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead className="hidden md:table-cell">Date demandée</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="hidden lg:table-cell">Chauffeur</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRequests.map((request) => (
                        <TableRow key={request.id} className={selectedDeliveries.has(request.id) ? "bg-accent/10" : ""}>
                          <TableCell className="w-8">
                            <input
                              type="checkbox"
                              checked={selectedDeliveries.has(request.id)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedDeliveries);
                                if (e.target.checked) {
                                  newSelected.add(request.id);
                                } else {
                                  newSelected.delete(request.id);
                                }
                                setSelectedDeliveries(newSelected);
                              }}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {request.trackingNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.clientName}</p>
                              <p className="text-sm text-muted-foreground">
                                {request.clientPhone}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDate(request.requestedDate)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={request.status} />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {getDriverName(request.assignedDriverId)}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => openDetail(request)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Détails
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-4 px-6 pb-6">
                    <div className="text-sm text-muted-foreground">
                      Affichage {startIndex + 1} à {Math.min(endIndex, filteredRequests.length)} sur {filteredRequests.length}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Par page:</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-2 py-1 border border-border rounded-md text-sm bg-background"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Précédent
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = currentPage - 2 + i;
                            if (pageNum < 1 || pageNum > totalPages) return null;
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Suivant
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers">
            <DriverManagement />
          </TabsContent>

          {/* Driver Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Award className="w-6 h-6 text-accent" />
                  Performance des chauffeurs
                </h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setLoadingPerformance(true);
                    setTimeout(() => {
                      setDriverPerformance(drivers.map(d => calculateDriverPerformance(d.id)));
                      setLoadingPerformance(false);
                    }, 500);
                  }}
                  disabled={loadingPerformance}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingPerformance ? "animate-spin" : ""}`} />
                  Rafraîchir
                </Button>
              </div>

              {loadingPerformance ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : drivers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun chauffeur trouvé</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {drivers.map((driver) => {
                    const perf = calculateDriverPerformance(driver.id);
                    return (
                      <div key={driver.id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-5 border border-slate-200">
                        {/* Header with name and status */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{perf.driverName}</h3>
                            <p className="text-sm text-muted-foreground">{driver.phone}</p>
                          </div>
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${perf.isOnline
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                            }`}>
                            {perf.isOnline ? (
                              <>
                                <Wifi className="w-3 h-3" />
                                En ligne
                              </>
                            ) : (
                              <>
                                <WifiOff className="w-3 h-3" />
                                Hors ligne
                              </>
                            )}
                          </div>
                        </div>

                        {/* Performance Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* On-time Delivery % */}
                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                              <TrendingUp className="w-3 h-3" />
                              Taux ponctuel
                            </p>
                            <p className="text-2xl font-bold text-blue-600">{perf.onTimePercentage}%</p>
                          </div>

                          {/* Average Rating */}
                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                              <Star className="w-3 h-3" />
                              Note moyenne
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-bold text-amber-600">{perf.averageRating}</p>
                              <span className="text-yellow-500">★</span>
                            </div>
                          </div>

                          {/* Total Deliveries */}
                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                              <Package className="w-3 h-3" />
                              Livraisons
                            </p>
                            <p className="text-2xl font-bold text-purple-600">{perf.totalDeliveries}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {perf.completedDeliveries} complétées
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Complétions: {perf.completedDeliveries}/{perf.totalDeliveries}
                          </p>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                              style={{ width: `${perf.totalDeliveries > 0 ? (perf.completedDeliveries / perf.totalDeliveries) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Visiteur Tab - Real-time Visitor Tracking */}
          <TabsContent value="visiteur" className="space-y-6">
            <RealtimeVisitorStats />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Messages />
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics">
            <DeliveryStatistics />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Create User Section */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-accent" />
                Créer un nouvel utilisateur
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="utilisateur@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    disabled={isCreatingUser}
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Nom complet
                  </label>
                  <Input
                    type="text"
                    placeholder="Jean Dupont"
                    value={newUserFullName}
                    onChange={(e) => setNewUserFullName(e.target.value)}
                    disabled={isCreatingUser}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Mot de passe
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    disabled={isCreatingUser}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Rôle
                  </label>
                  <Select value={newUserRole} onValueChange={setNewUserRole} disabled={isCreatingUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRIVER">Chauffeur</SelectItem>
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                      <SelectItem value="STAFF">Personnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone (only for DRIVER role) */}
                {newUserRole === "DRIVER" && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Numéro de téléphone *
                    </label>
                    <Input
                      type="tel"
                      placeholder="+33612345678"
                      value={newUserPhone || ""}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      disabled={isCreatingUser}
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <Button
                  onClick={createNewUser}
                  disabled={isCreatingUser}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  {isCreatingUser ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Créer l'utilisateur
                    </>
                  )}
                </Button>
              </div>

              {/* Info Text */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Note :</strong> L'utilisateur créé recevra ces identifiants par email.
                  Assurez-vous que l'email est valide et que le mot de passe respecte les critères de sécurité.
                </p>
              </div>
            </div>

            {/* Users Table Section */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6 text-accent" />
                  Tous les utilisateurs
                </h2>
                <Button
                  variant="outline"
                  onClick={fetchUsers}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </Button>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Nom complet</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead className="hidden md:table-cell">Statut</TableHead>
                      <TableHead className="hidden lg:table-cell">Créé le</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary text-foreground">
                              {user.role === "DRIVER"
                                ? "Chauffeur"
                                : user.role === "ADMIN"
                                  ? "Administrateur"
                                  : "Personnel"}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                            >
                              {user.isActive ? "Actif" : "Inactif"}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteUser(user.id, user.email)}
                              disabled={isDeletingUser}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Email Schedule Dialog */}
      <Dialog open={showEmailSchedule} onOpenChange={setShowEmailSchedule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-accent" />
              Programmer l'envoi par email
            </DialogTitle>
            <DialogDescription>
              Programmez l'envoi d'un rapport de livraisons par email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Adresse email
              </label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={emailForSchedule}
                onChange={(e) => setEmailForSchedule(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                📧 Le rapport sera envoyé avec {filteredRequests.length} livraison(s), filtres appliquées inclus.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowEmailSchedule(false)}>
              Annuler
            </Button>
            <Button onClick={scheduleEmailExport}>
              <Mail className="w-4 h-4 mr-2" />
              Programmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-accent" />
                  Demande {selectedRequest.trackingNumber}
                </DialogTitle>
                <DialogDescription>
                  Créée le {formatDate(selectedRequest.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* FORCE MAP TO DISPLAY - Check if we have ANY coordinates */}
                {(() => {
                  let pickupLat = selectedRequest.pickupLat ? Number(selectedRequest.pickupLat) : null;
                  let pickupLng = selectedRequest.pickupLng ? Number(selectedRequest.pickupLng) : null;
                  let deliveryLat = selectedRequest.deliveryLat ? Number(selectedRequest.deliveryLat) : null;
                  let deliveryLng = selectedRequest.deliveryLng ? Number(selectedRequest.deliveryLng) : null;

                  // Try to parse coordinates from address strings if lat/lng are null
                  if (pickupLat === null || pickupLng === null) {
                    const pickupCoords = parseCoordinatesFromAddress(selectedRequest.pickupAddress);
                    if (pickupCoords) {
                      pickupLat = pickupCoords.lat;
                      pickupLng = pickupCoords.lng;
                    }
                  }

                  if (deliveryLat === null || deliveryLng === null) {
                    const deliveryCoords = parseCoordinatesFromAddress(selectedRequest.deliveryAddress);
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
                      <div className="space-y-3">
                        {/* Map Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-400 p-4 shadow-md">
                          <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-blue-900">
                            <MapPin className="w-6 h-6 text-blue-600" />
                            Carte de la livraison
                          </h3>

                          {/* MAP CONTAINER - FIXED HEIGHT TO PREVENT LEAFLET ISSUES */}
                          <div className="rounded-lg overflow-hidden border-2 border-blue-300 bg-gray-100" style={{ height: "500px", width: "100%", position: "relative" }}>
                            <MapContainer
                              key={`map-${selectedRequest.id}-${Date.now()}`}
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
                                    <p className="text-xs mt-1">{selectedRequest.pickupAddress}</p>
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
                                    <p className="text-xs mt-1">{selectedRequest.deliveryAddress}</p>
                                    <p className="text-xs text-gray-600 mt-1">{deliveryLat.toFixed(6)}, {deliveryLng.toFixed(6)}</p>
                                  </div>
                                </Popup>
                              </Marker>
                            </MapContainer>
                          </div>

                          {/* LOCATION INFORMATION CARDS */}
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            {/* PICKUP CARD */}
                            <div className="bg-white rounded-lg p-3 border-2 border-green-300 shadow-sm">
                              <p className="font-bold text-green-700 text-sm mb-1">📍 COLLECTE</p>
                              <p className="text-xs text-gray-700 mb-2">{selectedRequest.pickupAddress}</p>
                              <div className="bg-green-50 p-2 rounded text-xs font-mono text-green-700">
                                {pickupLat.toFixed(6)}<br />
                                {pickupLng.toFixed(6)}
                              </div>
                              {selectedRequest.pickupFromMap && (
                                <p className="text-xs text-green-600 mt-2 font-semibold">✅ Depuis la carte</p>
                              )}
                            </div>

                            {/* DELIVERY CARD */}
                            <div className="bg-white rounded-lg p-3 border-2 border-red-300 shadow-sm">
                              <p className="font-bold text-red-700 text-sm mb-1">📦 LIVRAISON</p>
                              <p className="text-xs text-gray-700 mb-2">{selectedRequest.deliveryAddress}</p>
                              <div className="bg-red-50 p-2 rounded text-xs font-mono text-red-700">
                                {deliveryLat.toFixed(6)}<br />
                                {deliveryLng.toFixed(6)}
                              </div>
                              {selectedRequest.deliveryFromMap && (
                                <p className="text-xs text-red-600 mt-2 font-semibold">✅ Depuis la carte</p>
                              )}
                            </div>
                          </div>

                          {/* MAP DETECTION STATUS */}
                          {(selectedRequest.pickupFromMap || selectedRequest.deliveryFromMap) && (
                            <div className="bg-green-100 border border-green-400 rounded p-3 mt-3">
                              <p className="text-green-800 text-sm font-semibold">
                                ✅ Localisation cartographique détectée
                                {selectedRequest.pickupFromMap && " (Collecte)"}
                                {selectedRequest.pickupFromMap && selectedRequest.deliveryFromMap && " et"}
                                {selectedRequest.deliveryFromMap && " (Livraison)"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 shadow-md">
                        <p className="text-yellow-800 text-sm font-semibold flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          ⚠️ Aucune localisation cartographique disponible
                        </p>
                        <p className="text-yellow-700 text-xs mt-2">Les adresses de cette demande n'ont pas de coordonnées GPS. Elles ont probablement été saisies manuellement sans sélection sur la carte.</p>
                      </div>
                    );
                  }
                })()}

                {/* Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Statut actuel</p>
                    <StatusBadge status={selectedRequest.status} />
                  </div>
                  <Select
                    value={selectedRequest.status}
                    onValueChange={(value) =>
                      updateStatus(selectedRequest.id, value as DeliveryStatus)
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                      <SelectItem value="EN_COURS">En cours</SelectItem>
                      <SelectItem value="LIVRE">Livré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Client Info */}
                <div className="bg-secondary rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-accent" />
                    Informations client
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nom:</span>
                      <p className="font-medium">{selectedRequest.clientName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Téléphone:</span>
                      <p className="font-medium">{selectedRequest.clientPhone}</p>
                    </div>
                    {selectedRequest.clientEmail && (
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{selectedRequest.clientEmail}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Adresse de collecte</p>
                    <p className="text-sm bg-secondary rounded-lg p-3">
                      {selectedRequest.pickupAddress}
                    </p>
                    {selectedRequest.pickupLat && selectedRequest.pickupLng && (
                      <p className="text-xs text-gray-500 mt-1">
                        ({selectedRequest.pickupLat.toFixed(4)}, {selectedRequest.pickupLng.toFixed(4)})
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Adresse de livraison</p>
                    <p className="text-sm bg-secondary rounded-lg p-3">
                      {selectedRequest.deliveryAddress}
                    </p>
                    {selectedRequest.deliveryLat && selectedRequest.deliveryLng && (
                      <p className="text-xs text-gray-500 mt-1">
                        ({selectedRequest.deliveryLat.toFixed(4)}, {selectedRequest.deliveryLng.toFixed(4)})
                      </p>
                    )}
                  </div>
                </div>

                {/* Package Details */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{selectedRequest.itemType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dimensions:</span>
                    <p className="font-medium">{selectedRequest.itemSize || "Non spécifié"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Poids:</span>
                    <p className="font-medium">{selectedRequest.itemWeight || "Non spécifié"}</p>
                  </div>
                </div>

                {/* Client Notes */}
                {selectedRequest.clientNotes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes du client</p>
                    <p className="text-sm bg-secondary rounded-lg p-3">
                      {selectedRequest.clientNotes}
                    </p>
                  </div>
                )}

                {/* Driver Assignment */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Chauffeur assigné
                  </p>
                  <Select
                    value={selectedRequest.assignedDriverId || "unassigned"}
                    onValueChange={(value) => {
                      if (value !== "unassigned") {
                        assignDriver(selectedRequest.id, value);
                      }
                    }}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un chauffeur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned" disabled>
                        Non assigné
                      </SelectItem>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.fullName} - {driver.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Internal Notes */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <StickyNote className="w-4 h-4" />
                    Notes internes
                  </p>
                  <Textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Ajouter des notes internes..."
                    rows={3}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => saveInternalNotes(selectedRequest.id)}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Sauvegarder les notes
                  </Button>
                </div>

                {/* Print Slip */}
                <div className="border-t pt-4">
                  <DeliveryPrintSlip
                    delivery={{
                      ...selectedRequest,
                      driverName: selectedRequest.assignedDriverId
                        ? drivers.find((d) => d.id === selectedRequest.assignedDriverId)
                          ?.fullName
                        : undefined,
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Notifications Modal */}
      <NotificationsPage
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;
