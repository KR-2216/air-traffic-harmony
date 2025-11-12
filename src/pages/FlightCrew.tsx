import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, Users } from 'lucide-react';

interface FlightCrew {
  flight_id: number;
  staff_id: number;
  role: 'Pilot' | 'Co-Pilot' | 'Cabin Crew' | 'Ground Staff' | 'Security' | 'Admin' | 'Gate Agent' | 'Maintenance';
  flight?: { flight_number: string; airline?: { airline_name: string } };
  staff?: { name: string };
}

interface Flight {
  flight_id: number;
  flight_number: string;
  airline: { airline_name: string } | null;
}

interface Staff {
  staff_id: number;
  name: string;
  role: string;
}

export default function FlightCrew() {
  const [flightCrew, setFlightCrew] = useState<FlightCrew[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    flight_id: '',
    staff_id: '',
    role: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [crewRes, flightsRes, staffRes] = await Promise.all([
        supabase.from('flight_crew').select('*, flight!inner(flight_number, airline!inner(airline_name)), staff!inner(name)').order('flight_id'),
        supabase.from('flight').select('flight_id, flight_number, airline:airline!inner(airline_name)').order('flight_number') as any,
        supabase.from('staff').select('staff_id, name, role').order('name'),
      ]);

      if (crewRes.error) throw crewRes.error;
      if (flightsRes.error) throw flightsRes.error;
      if (staffRes.error) throw staffRes.error;

      setFlightCrew(crewRes.data || []);
      setFlights(flightsRes.data || []);
      setStaff(staffRes.data || []);
    } catch (error: any) {
      toast.error('Failed to fetch data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      flight_id: parseInt(formData.flight_id),
      staff_id: parseInt(formData.staff_id),
      role: formData.role,
    };

    try {
      const { error } = await supabase
        .from('flight_crew')
        .insert([data]);

      if (error) throw error;
      toast.success('Flight crew assigned successfully');
      setOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (flightId: number, staffId: number) => {
    if (!confirm('Are you sure you want to remove this crew assignment?')) return;

    try {
      const { error } = await supabase
        .from('flight_crew')
        .delete()
        .eq('flight_id', flightId)
        .eq('staff_id', staffId);

      if (error) throw error;
      toast.success('Crew assignment removed successfully');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to remove assignment: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ flight_id: '', staff_id: '', role: '' });
  };

  const openCreateDialog = () => {
    resetForm();
    setOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Flight Crew Management</h1>
        <p className="text-muted-foreground">Assign and manage crew members for flights.</p>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Users className="mr-2 h-4 w-4" />
              Assign Crew
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Crew to Flight</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Flight</Label>
                <Select required value={formData.flight_id} onValueChange={(value) => setFormData({ ...formData, flight_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select flight" />
                  </SelectTrigger>
                  <SelectContent>
                    {flights.map((f) => (
                      <SelectItem key={f.flight_id} value={f.flight_id.toString()}>
                        {f.flight_number} - {f.airline?.airline_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Staff Member</Label>
                <Select required value={formData.staff_id} onValueChange={(value) => setFormData({ ...formData, staff_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.staff_id} value={s.staff_id.toString()}>
                        {s.name} ({s.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select required value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pilot">Pilot</SelectItem>
                    <SelectItem value="Co-Pilot">Co-Pilot</SelectItem>
                    <SelectItem value="Cabin Crew">Cabin Crew</SelectItem>
                    <SelectItem value="Ground Staff">Ground Staff</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Gate Agent">Gate Agent</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Assign</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flight Crew Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flight</TableHead>
                <TableHead>Airline</TableHead>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flightCrew.map((crew) => (
                <TableRow key={`${crew.flight_id}-${crew.staff_id}`}>
                  <TableCell>{crew.flight?.flight_number}</TableCell>
                  <TableCell>{crew.flight?.airline?.airline_name}</TableCell>
                  <TableCell>{crew.staff?.name}</TableCell>
                  <TableCell>{crew.role}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(crew.flight_id, crew.staff_id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
