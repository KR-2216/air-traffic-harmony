import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase';
import { Plane, Users, AlertCircle, Wrench, TrendingUp, Calendar } from 'lucide-react';

const Index = () => {
  const { userRole } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [flights, airports, staff, incidents, maintenance] = await Promise.all([
        supabase.from('flight').select('*', { count: 'exact', head: true }),
        supabase.from('airport').select('*', { count: 'exact', head: true }),
        supabase.from('staff').select('*', { count: 'exact', head: true }),
        supabase.from('incident_log').select('*', { count: 'exact', head: true }),
        supabase.from('maintenance_log').select('*').eq('status', 'Scheduled'),
      ]);

      return {
        totalFlights: flights.count || 0,
        totalAirports: airports.count || 0,
        totalStaff: staff.count || 0,
        totalIncidents: incidents.count || 0,
        pendingMaintenance: maintenance.data?.length || 0,
      };
    },
  });

  const { data: activeFlights } = useQuery({
    queryKey: ['active-flights'],
    queryFn: async () => {
      const { data } = await supabase
        .from('active_flights_view')
        .select('*')
        .limit(5);
      return data || [];
    },
  });

  const { data: upcomingMaintenance } = useQuery({
    queryKey: ['upcoming-maintenance'],
    queryFn: async () => {
      const { data } = await supabase
        .from('upcoming_maintenance_view')
        .select('*')
        .limit(5);
      return data || [];
    },
    enabled: userRole === 'admin' || userRole === 'maintenance' || userRole === 'airport_operator',
  });

  const getDashboardCards = () => {
    const commonCards = [
      {
        title: 'Total Flights',
        value: stats?.totalFlights || 0,
        icon: Plane,
        description: 'All scheduled flights',
        color: 'text-primary'
      }
    ];

    if (userRole === 'admin') {
      return [
        ...commonCards,
        {
          title: 'Airports',
          value: stats?.totalAirports || 0,
          icon: TrendingUp,
          description: 'Active airports',
          color: 'text-accent'
        },
        {
          title: 'Staff Members',
          value: stats?.totalStaff || 0,
          icon: Users,
          description: 'Total staff',
          color: 'text-success'
        },
        {
          title: 'Incidents',
          value: stats?.totalIncidents || 0,
          icon: AlertCircle,
          description: 'Logged incidents',
          color: 'text-warning'
        },
        {
          title: 'Pending Maintenance',
          value: stats?.pendingMaintenance || 0,
          icon: Wrench,
          description: 'Scheduled tasks',
          color: 'text-destructive'
        }
      ];
    }

    if (userRole === 'maintenance' || userRole === 'airport_operator') {
      return [
        ...commonCards,
        {
          title: 'Pending Maintenance',
          value: stats?.pendingMaintenance || 0,
          icon: Wrench,
          description: 'Scheduled tasks',
          color: 'text-warning'
        }
      ];
    }

    if (userRole === 'security') {
      return [
        ...commonCards,
        {
          title: 'Incidents',
          value: stats?.totalIncidents || 0,
          icon: AlertCircle,
          description: 'Logged incidents',
          color: 'text-warning'
        }
      ];
    }

    return commonCards;
  };

  const dashboardCards = getDashboardCards();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your airport operations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              Active Flights
            </CardTitle>
            <CardDescription>Currently boarding or departed flights</CardDescription>
          </CardHeader>
          <CardContent>
            {activeFlights && activeFlights.length > 0 ? (
              <div className="space-y-3">
                {activeFlights.map((flight: any) => (
                  <div key={flight.flight_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{flight.flight_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {flight.departure_airport} → {flight.arrival_airport}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      flight.status === 'Departed' ? 'bg-success/10 text-success' :
                      flight.status === 'Boarding' ? 'bg-accent/10 text-accent' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {flight.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active flights</p>
            )}
          </CardContent>
        </Card>

        {(userRole === 'admin' || userRole === 'maintenance' || userRole === 'airport_operator') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-warning" />
                Upcoming Maintenance
              </CardTitle>
              <CardDescription>Scheduled maintenance tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMaintenance && upcomingMaintenance.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMaintenance.map((item: any) => (
                    <div key={item.maintenance_log_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{item.resource_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.resource_name}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        item.status === 'Scheduled' ? 'bg-warning/10 text-warning' :
                        item.status === 'In Progress' ? 'bg-accent/10 text-accent' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming maintenance</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
