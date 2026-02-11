import { useEffect, useState } from "react";
import { Users, Eye, Globe, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VisitorStats {
  totalVisitors: number;
  uniqueSessions: number;
  landingPageVisitors: number;
  landingPageSessions: number;
  demandPageVisitors: number;
  demandPageSessions: number;
  contactPageVisitors: number;
  contactPageSessions: number;
  deliveryRequestVisitors: number;
  deliveryRequestSessions: number;
  lastHourVisitors: number;
  lastHourSessions: number;
}

export const VisitorStats = () => {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedToWebSocket, setConnectedToWebSocket] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(24);

  // Fetch initial stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/page-views/stats?lastHours=${selectedPeriod}`);
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
  }, [selectedPeriod]);

  // Connect to WebSocket for live updates
  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
    const WEBSOCKET_URL = API_BASE_URL.replace('/api', '/ws/notifications');

    // Dynamic import to avoid issues with isomorphic code
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

            // Subscribe to visitor stats updates
            client.subscribe("/topic/visitor-stats", (message: any) => {
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
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    subtext,
    color = "blue",
  }: {
    title: string;
    value: number | string;
    icon: any;
    subtext?: string;
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
              {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
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
          <h2 className="text-2xl font-bold text-gray-900">Visiteur - Performance en Temps Réel</h2>
          <p className="text-sm text-gray-500 mt-1">Suivi des visiteurs en direct sur votre site web</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${connectedToWebSocket ? "bg-green-500 animate-pulse" : "bg-gray-300"
              }`}
          />
          <span className="text-sm font-medium text-gray-600">
            {connectedToWebSocket ? "En direct" : "Polling"}
          </span>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {[1, 6, 24, 168].map((hours) => (
          <button
            key={hours}
            onClick={() => setSelectedPeriod(hours)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedPeriod === hours
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            {hours === 1 ? "1h" : hours === 6 ? "6h" : hours === 24 ? "24h" : "1w"}
          </button>
        ))}
      </div>

      {isLoading && !stats ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-500">Chargement des statistiques...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Visiteurs Totaux"
              value={stats?.totalVisitors || 0}
              icon={Users}
              subtext={`${stats?.uniqueSessions || 0} sessions uniques`}
              color="blue"
            />
            <StatCard
              title="Visiteurs (Dernière heure)"
              value={stats?.lastHourVisitors || 0}
              icon={Clock}
              subtext={`${stats?.lastHourSessions || 0} sessions`}
              color="green"
            />
            <StatCard
              title="Sessions Uniques"
              value={stats?.uniqueSessions || 0}
              icon={Globe}
              subtext="Utilisateurs distincts"
              color="purple"
            />
            <StatCard
              title="Vue d'ensemble"
              value={stats?.totalVisitors || 0}
              icon={Eye}
              subtext="Pages vues"
              color="orange"
            />
          </div>

          {/* Page-Specific Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques par Page</CardTitle>
              <CardDescription>
                Répartition des visiteurs par section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Page d'Accueil</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats?.landingPageVisitors || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.landingPageSessions || 0} sessions
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Demandes de Livraison</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {stats?.demandPageVisitors || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.demandPageSessions || 0} sessions
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Demandes de Livraison (Détail)</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats?.deliveryRequestVisitors || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.deliveryRequestSessions || 0} sessions
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Page de Contact</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats?.contactPageVisitors || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.contactPageSessions || 0} sessions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Updates Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Mise à Jour en Temps Réel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800">
                Ces statistiques se mettent à jour automatiquement chaque 30 secondes. Vous pouvez
                voir le nombre de visiteurs actuels et les sessions actives en direct sur votre
                site web.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
