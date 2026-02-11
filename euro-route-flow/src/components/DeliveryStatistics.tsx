import { useState, useEffect, useMemo } from "react";
import { deliveryRequestApi, driverApi } from "@/integrations/api/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp, Clock, Truck, Package, Users } from "lucide-react";

interface DeliveryRequest {
  id: string;
  status: "EN_ATTENTE" | "EN_COURS" | "LIVRE";
  createdAt: string;
  requestedDate: string;
  completedAt: string | null;
  assignedDriverId: string | null;
}

interface Driver {
  id: string;
  fullName: string;
  isActive: boolean;
}

const STATUS_COLORS = {
  EN_ATTENTE: "hsl(221, 83%, 53%)",
  EN_COURS: "hsl(32, 95%, 44%)",
  LIVRE: "hsl(142, 71%, 45%)",
};

const STATUS_LABELS = {
  EN_ATTENTE: "En attente",
  EN_COURS: "En cours",
  LIVRE: "Livrées",
};

export function DeliveryStatistics() {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"7" | "30" | "90" | "365">("30");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [requestsData, driversData] = await Promise.all([
        deliveryRequestApi.getAll(),
        driverApi.getAll(),
      ]);

      setRequests(requestsData || []);
      setDrivers(driversData || []);
    } catch (error) {
      // Failed to fetch statistics
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests by period
  const filteredRequests = useMemo(() => {
    const now = new Date();
    const daysAgo = parseInt(period);
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return requests.filter((r) => new Date(r.createdAt) >= cutoff);
  }, [requests, period]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    const counts = {
      EN_ATTENTE: 0,
      EN_COURS: 0,
      LIVRE: 0,
    };
    filteredRequests.forEach((r) => {
      counts[r.status]++;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
      value: count,
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
    }));
  }, [filteredRequests]);

  // Daily volume for bar chart
  const dailyVolume = useMemo(() => {
    const days = parseInt(period);
    const data: { date: string; count: number; label: string }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const count = filteredRequests.filter(
        (r) => r.createdAt.split("T")[0] === dateStr
      ).length;
      data.push({
        date: dateStr,
        count,
        label: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
      });
    }

    // Group by week if period is large
    if (days > 30) {
      const weeklyData: { date: string; count: number; label: string }[] = [];
      for (let i = 0; i < data.length; i += 7) {
        const week = data.slice(i, i + 7);
        const total = week.reduce((sum, d) => sum + d.count, 0);
        weeklyData.push({
          date: week[0].date,
          count: total,
          label: `Sem. ${Math.floor(i / 7) + 1}`,
        });
      }
      return weeklyData;
    }

    return data;
  }, [filteredRequests, period]);

  // Monthly trend for line chart
  const monthlyTrend = useMemo(() => {
    const months: { [key: string]: { total: number; delivered: number } } = {};

    requests.forEach((r) => {
      const month = r.createdAt.substring(0, 7);
      if (!months[month]) {
        months[month] = { total: 0, delivered: 0 };
      }
      months[month].total++;
      if (r.status === "LIVRE") {
        months[month].delivered++;
      }
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => {
        const [year, m] = month.split("-");
        const date = new Date(parseInt(year), parseInt(m) - 1);
        return {
          month: date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
          total: data.total,
          delivered: data.delivered,
        };
      });
  }, [requests]);

  // Driver performance
  const driverPerformance = useMemo(() => {
    const performance: { [key: string]: { total: number; delivered: number } } = {};

    filteredRequests.forEach((r) => {
      if (r.assignedDriverId) {
        if (!performance[r.assignedDriverId]) {
          performance[r.assignedDriverId] = { total: 0, delivered: 0 };
        }
        performance[r.assignedDriverId].total++;
        if (r.status === "LIVRE") {
          performance[r.assignedDriverId].delivered++;
        }
      }
    });

    return Object.entries(performance)
      .map(([driverId, data]) => {
        const driver = drivers.find((d) => d.id === driverId);
        return {
          name: driver?.fullName || "Inconnu",
          assigned: data.total,
          delivered: data.delivered,
        };
      })
      .sort((a, b) => b.assigned - a.assigned)
      .slice(0, 5);
  }, [filteredRequests, drivers]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const delivered = filteredRequests.filter((r) => r.status === "LIVRE");
    const avgDeliveryTime = delivered.length > 0
      ? delivered
        .filter((r) => r.completedAt)
        .reduce((sum, r) => {
          const created = new Date(r.createdAt).getTime();
          const completed = new Date(r.completedAt!).getTime();
          return sum + (completed - created) / (1000 * 60 * 60);
        }, 0) / delivered.filter((r) => r.completedAt).length
      : 0;

    return {
      total: filteredRequests.length,
      pending: filteredRequests.filter((r) => r.status === "EN_ATTENTE").length,
      inProgress: filteredRequests.filter((r) => r.status === "EN_COURS").length,
      delivered: delivered.length,
      completionRate: filteredRequests.length > 0
        ? Math.round((delivered.length / filteredRequests.length) * 100)
        : 0,
      avgDeliveryHours: Math.round(avgDeliveryTime),
    };
  }, [filteredRequests]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Statistiques</h2>
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">3 derniers mois</SelectItem>
            <SelectItem value="365">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{summaryStats.total}</p>
              <p className="text-sm text-muted-foreground">Demandes</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{summaryStats.completionRate}%</p>
              <p className="text-sm text-muted-foreground">Taux de livraison</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {summaryStats.avgDeliveryHours > 0 ? `${summaryStats.avgDeliveryHours}h` : "—"}
              </p>
              <p className="text-sm text-muted-foreground">Délai moyen</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {drivers.filter((d) => d.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Chauffeurs actifs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Répartition par statut
          </h3>
          {filteredRequests.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Aucune donnée
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent > 0 ? `${name} (${(percent * 100).toFixed(0)}%)` : ""
                  }
                  labelLine={false}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Daily Volume Bar Chart */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Volume des demandes
          </h3>
          {dailyVolume.length === 0 || dailyVolume.every((d) => d.count === 0) ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Aucune donnée
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value) => [value, "Demandes"]}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Trend Line Chart */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Tendance mensuelle
          </h3>
          {monthlyTrend.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Aucune donnée
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  name="Livrées"
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(142, 71%, 45%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Driver Performance Bar Chart */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Performance chauffeurs (Top 5)
          </h3>
          {driverPerformance.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Aucune donnée
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={driverPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="assigned" name="Assignées" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="delivered" name="Livrées" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
