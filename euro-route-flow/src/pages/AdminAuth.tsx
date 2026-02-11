import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Truck, Loader2, Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const AdminAuth = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, isLoading } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!isLoading && user) {
      // User is already logged in, redirect to appropriate dashboard
      const redirectPath = user.role === "driver" ? "/driver/dashboard" : "/admin/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
      </div>
    );
  }

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        let message = "Erreur de connexion";
        if (error.message.includes("Invalid login credentials")) {
          message = "Email ou mot de passe incorrect";
        } else if (error.message.includes("Email not confirmed")) {
          message = "Veuillez confirmer votre email avant de vous connecter";
        }
        toast({ title: "Erreur", description: message, variant: "destructive" });
      } else {
        // Get the stored user to check their role
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            const redirectPath = user.role === "driver" ? "/driver/dashboard" : "/admin/dashboard";
            setTimeout(() => {
              navigate(redirectPath);
            }, 100);
          } catch (e) {
            // If parsing fails, default to admin dashboard
            setTimeout(() => {
              navigate("/admin/dashboard");
            }, 100);
          }
        } else {
          // Fallback to admin dashboard
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 100);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <Truck className="w-7 h-7 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">
              ExpressLivraison
            </span>
          </Link>
          <p className="text-primary-foreground/70 mt-2">Espace administration</p>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl shadow-xl p-6 lg:p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>

          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className="pl-10"
                  {...loginForm.register("email")}
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...loginForm.register("password")}
                />
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Retour au site
            </Link>
          </div>
        </div>

        <p className="text-center text-primary-foreground/60 text-sm mt-6">
          Note : Seuls les membres du personnel autorisés peuvent accéder au tableau de bord.
        </p>
      </div>
    </div>
  );
};

export default AdminAuth;
