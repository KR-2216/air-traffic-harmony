import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, Trash2, Plane } from 'lucide-react';

interface RunwayAssignment {
  runway_assignment_id: number;
  flight_id: number;
  runway_id: number;
  assignment_window: string;
  flight?: { flight_number: string; airline?: { airline_name: string } };
  runway?: { runway_name: string; airport?: { airport_name: string } };
}

interface Flight {
  flight_id: number;
  flight_number: string;
  airline: { airline_name: string } | null;
}

interface Runway {
  runway_id: number;
  runway_name: string;
  airport: { airport_name: string } | null;
}

export default function RunwayAssignments() {
  const [assignments, setAssignments] = useState<RunwayAssignment[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [runways, setRunways] = useState<Runway[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<RunwayAssignment | null>(null);

  const [formData, setFormData] = useState({
    flight_id: '',
    runway_id: '',
    assignment_window: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, flightsRes, runwaysRes] = await Promise.all([
        supabase.from('runway_assignment').select('*, flight!inner(flight_number, airline!inner(airline_name)), runway!inner(runway_name, airport!inner(airport_name))').order('runway_assignment_id'),
        supabase.from('flight').select('flight_id, flight_number, airline:airline!inner(airline_name)').order('flight_number') as any,
        supabase.from('runway').select('runway_id, runway_name, airport:airport!inner(airport_name)').order('runway_name') as any,
      ]);

      if (assignmentsRes.error) throw assignmentsRes.error;
      if (flightsRes.error) throw flightsRes.error;
      if (runwaysRes.error) throw runwaysRes.error;

      setAssignments(assignmentsRes.data || []);
      setFlights(flightsRes.data || []);
      setRunways(runwaysRes.data || []);
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
      runway_id: parseInt(formData.runway_id),
      assignment_window: formData.assignment_window,
    };

    try {
      if (editingAssignment) {
        const { error } = await supabase
          .from('runway_assignment')
          .update(data)
          .eq('runway_assignment_id', editingAssignment.runway_assignment_id);

        if (error) throw error;
        toast.success('Runway assignment updated successfully');
      } else {
        const { error } = await supabase
          .from('runway_assignment')
          .insert([data]);

        if (error) throw error;
        toast.success('Runway assignment created successfully');
      }

      setOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const { error } = await supabase
        .from('runway_assignment')
        .delete()
        .eq('runway_assignment_id', id);

      if (error) throw error;
      toast.success('Assignment deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete assignment: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ flight_id: '', runway_id: '', assignment_window: '' });
    setEditingAssignment(null);
  };

  const openEditDialog = (assignment: RunwayAssignment) => {
    setEditingAssignment(assignment);
    setFormData({
      flight_id: assignment.flight_id.toString(),
      runway_id: assignment.runway_id.toString(),
      assignment_window: assignment.assignment_window,
    });
    setOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Runway Assignments</h1>
        <p className="text-muted-foreground">Manage runway assignments and time windows for flights.</p>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plane className="mr-2 h-4 w-4" />
              Assign Runway
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAssignment ? 'Edit Runway Assignment' : 'New Runway Assignment'}</DialogTitle>
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
                <Label>Runway</Label>
                <Select required value={formData.runway_id} onValueChange={(value) => setFormData({ ...formData, runway_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select runway" />
                  </SelectTrigger>
                  <SelectContent>
                    {runways.map((r) => (
                      <SelectItem key={r.runway_id} value={r.runway_id.toString()}>
                        {r.runway_name} - {r.airport?.airport_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignment Window (TSRANGE format)</Label>
                <Input
                  required
                  value={formData.assignment_window}
                  onChange={(e) => setFormData({ ...formData, assignment_window: e.target.value })}
                  placeholder='["2024-01-01 10:00:00","2024-01-01 12:00:00"]'
                />
                <p className="text-xs text-muted-foreground">
                  Format: ["start_time","end_time"] e.g., ["2024-01-01 10:00:00","2024-01-01 12:00:00"]
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAssignment ? 'Update' : 'Assign'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Runway Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flight</TableHead>
                <TableHead>Runway</TableHead>
                <TableHead>Airport</TableHead>
                <TableHead>Time Window</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.runway_assignment_id}>
                  <TableCell>{assignment.flight?.flight_number}</TableCell>
                  <TableCell>{assignment.runway?.runway_name}</TableCell>
                  <TableCell>{assignment.runway?.airport?.airport_name}</TableCell>
                  <TableCell>{assignment.assignment_window}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(assignment)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(assignment.runway_assignment_id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
