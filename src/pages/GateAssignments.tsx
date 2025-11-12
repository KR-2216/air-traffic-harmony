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
import { Pencil, Trash2, DoorOpen } from 'lucide-react';

interface GateAssignment {
  gate_assignment_id: number;
  flight_id: number;
  gate_id: number;
  assignment_window: string;
  flight?: { flight_number: string; airline?: { airline_name: string } };
  gate?: { gate_name: string; terminal?: { terminal_name: string } };
}

interface Flight {
  flight_id: number;
  flight_number: string;
  airline: { airline_name: string } | null;
}

interface Gate {
  gate_id: number;
  gate_name: string;
  terminal: { terminal_name: string } | null;
}

export default function GateAssignments() {
  const [assignments, setAssignments] = useState<GateAssignment[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<GateAssignment | null>(null);

  const [formData, setFormData] = useState({
    flight_id: '',
    gate_id: '',
    assignment_window: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, flightsRes, gatesRes] = await Promise.all([
        supabase.from('gate_assignment').select('*, flight!inner(flight_number, airline!inner(airline_name)), gate!inner(gate_name, terminal!inner(terminal_name))').order('gate_assignment_id'),
        supabase.from('flight').select('flight_id, flight_number, airline:airline!inner(airline_name)').order('flight_number') as any,
        supabase.from('gate').select('gate_id, gate_name, terminal:terminal!inner(terminal_name)').order('gate_name') as any,
      ]);

      if (assignmentsRes.error) throw assignmentsRes.error;
      if (flightsRes.error) throw flightsRes.error;
      if (gatesRes.error) throw gatesRes.error;

      setAssignments(assignmentsRes.data || []);
      setFlights(flightsRes.data || []);
      setGates(gatesRes.data || []);
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
      gate_id: parseInt(formData.gate_id),
      assignment_window: formData.assignment_window,
    };

    try {
      if (editingAssignment) {
        const { error } = await supabase
          .from('gate_assignment')
          .update(data)
          .eq('gate_assignment_id', editingAssignment.gate_assignment_id);

        if (error) throw error;
        toast.success('Gate assignment updated successfully');
      } else {
        const { error } = await supabase
          .from('gate_assignment')
          .insert([data]);

        if (error) throw error;
        toast.success('Gate assignment created successfully');
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
        .from('gate_assignment')
        .delete()
        .eq('gate_assignment_id', id);

      if (error) throw error;
      toast.success('Assignment deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete assignment: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ flight_id: '', gate_id: '', assignment_window: '' });
    setEditingAssignment(null);
  };

  const openEditDialog = (assignment: GateAssignment) => {
    setEditingAssignment(assignment);
    setFormData({
      flight_id: assignment.flight_id.toString(),
      gate_id: assignment.gate_id.toString(),
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
        <h1 className="text-3xl font-bold text-foreground">Gate Assignments</h1>
        <p className="text-muted-foreground">Manage gate assignments and boarding time windows for flights.</p>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <DoorOpen className="mr-2 h-4 w-4" />
              Assign Gate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAssignment ? 'Edit Gate Assignment' : 'New Gate Assignment'}</DialogTitle>
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
                <Label>Gate</Label>
                <Select required value={formData.gate_id} onValueChange={(value) => setFormData({ ...formData, gate_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gate" />
                  </SelectTrigger>
                  <SelectContent>
                    {gates.map((g) => (
                      <SelectItem key={g.gate_id} value={g.gate_id.toString()}>
                        {g.gate_name} - {g.terminal?.terminal_name}
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
          <CardTitle>Gate Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flight</TableHead>
                <TableHead>Gate</TableHead>
                <TableHead>Terminal</TableHead>
                <TableHead>Time Window</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.gate_assignment_id}>
                  <TableCell>{assignment.flight?.flight_number}</TableCell>
                  <TableCell>{assignment.gate?.gate_name}</TableCell>
                  <TableCell>{assignment.gate?.terminal?.terminal_name}</TableCell>
                  <TableCell>{assignment.assignment_window}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(assignment)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(assignment.gate_assignment_id)}>
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
