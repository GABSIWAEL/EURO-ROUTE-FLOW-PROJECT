import { useState, useEffect } from "react";
import { contactApi } from "@/integrations/api/client";
import { exportMessagesToExcel } from "@/lib/csvExport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import {
    Loader2,
    Mail,
    Trash2,
    Reply,
    CheckCircle2,
    Clock,
    MessageSquare,
    Download,
} from "lucide-react";

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    isRead: boolean;
    response: string | null;
    createdAt: string;
}

export function Messages() {
    const { toast } = useToast();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [responseText, setResponseText] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingMessage, setDeletingMessage] = useState<ContactMessage | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const data = await contactApi.getAll();
            setMessages(Array.isArray(data) ? data : []);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les messages",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRespond = async (messageId: string) => {
        if (!responseText.trim()) {
            toast({
                title: "Erreur",
                description: "Veuillez entrer une réponse",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            await contactApi.respond(messageId, responseText);

            setMessages(
                messages.map((msg) =>
                    msg.id === messageId
                        ? {
                            ...msg,
                            isRead: true,
                            response: responseText,
                        }
                        : msg
                )
            );

            setSelectedMessage(null);
            setResponseText("");
            toast({
                title: "Succès",
                description: "Réponse envoyée avec succès. Le message sera supprimé après 7 jours.",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible d'envoyer la réponse",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingMessage) return;

        setIsSaving(true);
        try {
            await contactApi.delete(deletingMessage.id);

            setMessages(messages.filter((m) => m.id !== deletingMessage.id));
            setIsDeleteDialogOpen(false);
            setDeletingMessage(null);
            toast({
                title: "Message supprimé",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de supprimer le message",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const newMessages = messages.filter((m) => !m.isRead).length;
    const respondedMessages = messages.filter((m) => m.response !== null && m.response !== "").length;

    // Pagination calculations
    const totalPages = Math.ceil(messages.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMessages = messages.slice(startIndex, endIndex);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{newMessages}</p>
                            <p className="text-sm text-muted-foreground">Nouveaux messages</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{respondedMessages}</p>
                            <p className="text-sm text-muted-foreground">Répondus</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Table */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Messages de contact</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {messages.length} message(s)
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportMessagesToExcel(messages)}
                                disabled={isLoading || messages.length === 0}
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Exporter Excel
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchMessages}
                                disabled={isLoading}
                                className="flex items-center gap-2"
                            >
                                <Clock className="w-4 h-4" />
                                Actualiser
                            </Button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Aucun message</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>De</TableHead>
                                    <TableHead>Sujet</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedMessages.map((message) => (
                                    <TableRow key={message.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-foreground">{message.name}</p>
                                                <p className="text-sm text-muted-foreground">{message.email}</p>
                                                <p className="text-sm text-muted-foreground">{message.phone}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {message.subject}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(message.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!message.isRead
                                                    ? "bg-amber-100 text-amber-800"
                                                    : message.response
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-slate-100 text-slate-800"
                                                    }`}
                                            >
                                                {!message.isRead ? "Nouveau" : message.response ? "Répondu" : "Lu"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedMessage(message);
                                                        setResponseText(message.response || "");
                                                    }}
                                                >
                                                    <Reply className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setDeletingMessage(message);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
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
                    </div>
                )}

                {/* Pagination Controls */}
                {messages.length > 0 && (
                    <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Affichage {startIndex + 1} à {Math.min(endIndex, messages.length)} sur {messages.length}
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

            {/* Response Dialog */}
            {selectedMessage && (
                <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Répondre au message</DialogTitle>
                            <DialogDescription>
                                De: {selectedMessage.name} ({selectedMessage.email}) - Tél: {selectedMessage.phone}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">Message original</h3>
                                <div className="bg-muted p-4 rounded-lg text-sm text-foreground">
                                    <p className="font-semibold mb-1">Sujet: {selectedMessage.subject}</p>
                                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="response">Ajouter le note de cette Tiket</Label>
                                <Textarea
                                    id="response"
                                    placeholder="Écrivez votre réponse..."
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    rows={6}
                                    disabled={isSaving || (selectedMessage.response !== null && selectedMessage.response !== "")}
                                />
                            </div>

                            {(selectedMessage.response !== null && selectedMessage.response !== "") && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800 font-semibold mb-2">Votre note:</p>
                                    <p className="text-sm text-green-900 whitespace-pre-wrap">{selectedMessage.response}</p>
                                </div>
                            )}

                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedMessage(null)}
                                    disabled={isSaving}
                                >
                                    Fermer
                                </Button>
                                {!selectedMessage.response && (
                                    <Button
                                        onClick={() => handleRespond(selectedMessage.id)}
                                        disabled={isSaving || !responseText.trim()}
                                    >
                                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Enregistrer la réponse
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce message?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vous êtes sur le point de supprimer le message de{" "}
                            <strong>{deletingMessage?.name}</strong> avec le sujet{" "}
                            <strong>{deletingMessage?.subject}</strong>. Cette action est irréversible.
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
