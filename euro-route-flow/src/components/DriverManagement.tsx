import { useState, useEffect } from "react";
import { driverApi } from "@/integrations/api/client";
import { exportDriversToExcel } from "@/lib/csvExport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Users,
  Phone,
  Mail,
  Search,
  UserCheck,
  Download,
  UserX,
} from "lucide-react";

interface Driver {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  isActive: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface DriverFormData {
  userId: string;
  phone: string;
  isActive: boolean;
}

const initialFormData: DriverFormData = {
  userId: "",
  phone: "",
  isActive: true,
};

export function DriverManagement() {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<DriverFormData>(initialFormData);

  // Fetch drivers and users
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch drivers from backend API
      const driversData = await driverApi.getAll();
      setDrivers(driversData || []);

      // Fetch available users from backend API
      try {
        const response = await fetch('http://localhost:8081/api/users/available', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Send cookies automatically
        });

        if (response.ok) {
          const usersData = await response.json();
          setUsers(Array.isArray(usersData) ? usersData : []);
        } else if (response.status === 401) {
          setUsers([]);
        } else {
          setUsers([]);
        }
      } catch (userError) {
        setUsers([]);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingDriver(null);
    setFormData(initialFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      userId: driver.userId || "",
      phone: driver.phone,
      isActive: driver.isActive,
    });
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (driver: Driver) => {
    setDeletingDriver(driver);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un numéro de téléphone",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingDriver) {
        // Update existing driver
        const updatedDriver = await driverApi.update(editingDriver.id, {
          phone: formData.phone.trim(),
          isActive: formData.isActive,
        });

        setDrivers(prev =>
          prev.map(d =>
            d.id === editingDriver.id
              ? updatedDriver
              : d
          )
        );

        toast({ title: "Chauffeur mis à jour" });
      } else {
        // Create new driver - extract fullName and email from selected user
        const selectedUser = formData.userId ? users.find(u => u.id === formData.userId) : null;
        const newDriver = await driverApi.create({
          fullName: selectedUser?.fullName || "",
          email: selectedUser?.email || "",
          phone: formData.phone.trim(),
          isActive: formData.isActive,
          userId: formData.userId || null,
        });

        setDrivers(prev => [...prev, newDriver].sort((a, b) =>
          a.fullName.localeCompare(b.fullName)
        ));

        toast({ title: "Chauffeur ajouté avec succès" });
      }

      setIsFormOpen(false);
      setFormData(initialFormData);
      setEditingDriver(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le chauffeur",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDriver) return;

    setIsSaving(true);
    try {
      await driverApi.delete(deletingDriver.id);

      setDrivers(prev => prev.filter(d => d.id !== deletingDriver.id));
      toast({ title: "Chauffeur supprimé" });
      setIsDeleteOpen(false);
      setDeletingDriver(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le chauffeur. Il est peut-être assigné à des livraisons.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDriverStatus = async (driver: Driver) => {
    try {
      await driverApi.update(driver.id, { isActive: !driver.isActive });

      setDrivers(prev =>
        prev.map(d =>
          d.id === driver.id ? { ...d, isActive: !driver.isActive } : d
        )
      );

      toast({
        title: driver.isActive ? "Chauffeur désactivé" : "Chauffeur activé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  // Filter drivers
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch =
      driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const isActive = driver.isActive === true;
    const matchesActive = !showActiveOnly || isActive;

    return matchesSearch && matchesActive;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDrivers = filteredDrivers.slice(startIndex, endIndex);

  // Stats
  const stats = {
    total: drivers.length,
    active: drivers.filter(d => d.isActive === true || d.isActive === 'true').length,
    inactive: drivers.filter(d => d.isActive === false || d.isActive === 'false').length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Actifs</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
              <p className="text-sm text-muted-foreground">Inactifs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-4 items-center w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un chauffeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active-only"
                checked={showActiveOnly}
                onCheckedChange={setShowActiveOnly}
              />
              <Label htmlFor="active-only" className="text-sm cursor-pointer">
                Actifs uniquement
              </Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportDriversToExcel(filteredDrivers)}
              className="flex items-center gap-2"
              disabled={filteredDrivers.length === 0}
            >
              <Download className="w-4 h-4" />
              Exporter Excel
            </Button>
            <Button onClick={openAddForm}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un chauffeur
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || showActiveOnly
                ? "Aucun chauffeur trouvé"
                : "Aucun chauffeur enregistré"}
            </p>
            {!searchTerm && !showActiveOnly && (
              <Button variant="outline" className="mt-4" onClick={openAddForm}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter le premier chauffeur
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden lg:table-cell">Ajouté le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">
                      {driver.fullName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {driver.phone}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {driver.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {driver.email}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleDriverStatus(driver)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${(driver.isActive === true || driver.isActive === 'true')
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                      >
                        {(driver.isActive === true || driver.isActive === 'true') ? "Actif" : "Inactif"}
                      </button>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {formatDate(driver.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditForm(driver)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteConfirm(driver)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 px-6 pb-6">
              <div className="text-sm text-muted-foreground">
                Affichage {startIndex + 1} à {Math.min(endIndex, filteredDrivers.length)} sur {filteredDrivers.length}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDriver ? "Modifier le chauffeur" : "Ajouter un chauffeur"}
            </DialogTitle>
            <DialogDescription>
              {editingDriver
                ? "Modifiez les informations du chauffeur"
                : "Sélectionnez un utilisateur pour l'enregistrer comme chauffeur"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingDriver && (
              <div className="space-y-2">
                <Label htmlFor="userId">Utilisateur</Label>
                <Select
                  value={formData.userId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, userId: value })
                  }
                >
                  <SelectTrigger id="userId">
                    <SelectValue placeholder="Sélectionnez un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {editingDriver && (
              <div className="space-y-2">
                <Label>Utilisateur</Label>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">
                    {editingDriver.email || editingDriver.fullName}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="06 12 34 56 78"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Chauffeur actif
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editingDriver ? "Mettre à jour" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce chauffeur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de supprimer{" "}
              <strong>{deletingDriver?.full_name}</strong>. Cette action est
              irréversible. Si le chauffeur est assigné à des livraisons, vous ne
              pourrez pas le supprimer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
