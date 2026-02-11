import { useEffect, useState } from "react";
import { Users, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RealtimeStats {
  totalVisitorsNow: number;
  landingPageVisitors: number;
  deliveryRequestVisitors: number;
  contactPageVisitors: number;
  demandPageVisitors: number;
  activeSessions: number;
  timestamp: string;
}

export const RealtimeVisitorStats = () => {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedToWebSocket, setConnectedToWebSocket] = useState(false);

  // Get API base URL from environment
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
  const WEBSOCKET_URL = API_BASE_URL.replace('/api', '/ws/notifications');

  // Fetch initial stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/visitors/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [API_BASE_URL]);

  // Connect to WebSocket for live updates
  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        const SockJS = (await import("sockjs-client")).default;
        const { Client } = await import("@stomp/stompjs");

        const socket = new SockJS(WEBSOCKET_URL);
        let client: any = null;

        client = new Client({
          webSocketFactory: () => socket,
          onConnect: () => {
            setConnectedToWebSocket(true);

            // Subscribe to real-time visitor updates
            client.subscribe("/topic/realtime-visitors", (message: any) => {
              if (message.body) {
                try {
                  const data = JSON.parse(message.body);
                  setStats(data);
                } catch (parseError) {
                  // Silent parse error
                }
              }
            });
          },
          onDisconnect: () => {
            setConnectedToWebSocket(false);
          },
          onStompError: (error: any) => {
            setConnectedToWebSocket(false);
          },
          onError: (error: any) => {
            setConnectedToWebSocket(false);
          },
        });

        client.activate();

        return () => {
          if (client && client.connected) {
            client.deactivate();
          }
        };
      } catch (error) {
        setConnectedToWebSocket(false);
      }
    };

    const cleanup = setupWebSocket();

    return () => {
      cleanup.then(fn => fn?.());
    };
  }, [WEBSOCKET_URL]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "blue",
  }: {
    title: string;
    value: number;
    icon: any;
    color?: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      purple: "bg-purple-50 text-purple-600",
      orange: "bg-orange-50 text-orange-600",
      red: "bg-red-50 text-red-600",
    };

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            </div>
            <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visiteurs en Direct</h2>
          <p className="text-sm text-gray-500 mt-1">Qui est actuellement sur votre site en temps réel</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${connectedToWebSocket ? "bg-green-500 animate-pulse" : "bg-gray-300"
              }`}
          />
          <span className="text-sm font-medium text-gray-600">
            {connectedToWebSocket ? "En direct" : "Offline"}
          </span>
        </div>
      </div>

      {isLoading && !stats ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-500">Chargement des visiteurs...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main Live Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
              <CardContent className="p-6">
                <div className="text-center text-white">
                  <p className="text-sm font-medium opacity-90">Visiteurs EN CE MOMENT</p>
                  <p className="text-5xl font-bold mt-4">{stats?.totalVisitorsNow || 0}</p>
                  <p className="text-xs opacity-75 mt-2">
                    {new Date(stats?.timestamp || "").toLocaleTimeString("fr-FR")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Last Update */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Sessions Actives</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.activeSessions || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Page-Specific Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Visiteurs par Page</CardTitle>
              <CardDescription>Répartition en temps réel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Page d'Accueil</h4>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats?.landingPageVisitors || 0}
                  </p>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Demandes de Livraison</h4>
                  <p className="text-3xl font-bold text-green-600">
                    {stats?.deliveryRequestVisitors || 0}
                  </p>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Pages de Demande</h4>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats?.demandPageVisitors || 0}
                  </p>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Contact</h4>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats?.contactPageVisitors || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-green-900">✨ En Temps Réel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800">
                Ces chiffres se mettent à jour automatiquement chaque 5 secondes. Vous voyez exactement
                qui est actuellement sur votre site. Les visiteurs disparaissent automatiquement après 30 minutes
                d'inactivité ou quand ils quittent le site.
              </p>
              <p className="text-xs text-green-700 mt-3">
                ℹ️ Aucune donnée n'est stockée en base de données - juste du suivi en temps réel!
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
