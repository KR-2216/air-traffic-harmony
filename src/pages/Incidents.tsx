
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function Incidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<any>(null);
  const [formData, setFormData] = useState({
    flight_id: '',
    description: '',
    location: '',
    incident_time: '',
    severity: 'Low',
    reported_by_staff_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [incidentsRes, flightsRes, staffRes] = await Promise.all([
      supabase.from('incident_log').select('*, flight:flight_id(*, airline:airline_id(*)), staff:reported_by_staff_id(*)').order('incident_time', { ascending: false }),
      supabase.from('flight').select('*, airline:airline_id(*)'),
      supabase.from('staff').select('*'),
    ]);

    if (incidentsRes.data) setIncidents(incidentsRes.data);
    if (flightsRes.data) setFlights(flightsRes.data);
    if (staffRes.data) setStaff(staffRes.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      flight_id: formData.flight_id ? parseInt(formData.flight_id) : null,
      reported_by_staff_id: formData.reported_by_staff_id ? parseInt(formData.reported_by_staff_id) : null,
    };

    if (editingIncident) {
      const { error } = await supabase
        .from('incident_log')
        .update(submitData)
        .eq('incident_log_id', editingIncident.incident_log_id);
      
      if (error) {
        toast.error('Failed to update incident');
      } else {
        toast.success('Incident updated successfully');
        setDialogOpen(false);
        fetchData();
        resetForm();
      }
    } else {
      const { error } = await supabase.from('incident_log').insert([submitData]);
      
      if (error) {
        toast.error('Failed to create incident');
      } else {
        toast.success('Incident created successfully');
        setDialogOpen(false);
        fetchData();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this incident?')) return;
    
    const { error } = await supabase.from('incident_log').delete().eq('incident_log_id', id);
    
    if (error) {
      toast.error('Failed to delete incident');
    } else {
      toast.success('Incident deleted successfully');
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({
      flight_id: '',
      description: '',
      location: '',
      incident_time: '',
      severity: 'Low',
      reported_by_staff_id: '',
    });
    setEditingIncident(null);
  };

  const openEditDialog = (incident: any) => {
    setEditingIncident(incident);
    setFormData({
      flight_id: incident.flight_id?.toString() || '',
      description: incident.description || '',
      location: incident.location || '',
      incident_time: incident.incident_time?.slice(0, 16) || '',
      severity: incident.severity,
      reported_by_staff_id: incident.reported_by_staff_id?.toString() || '',
    });
    setDialogOpen(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-destructive text-destructive-foreground';
      case 'High': return 'bg-warning text-warning-foreground';
      case 'Medium': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Incidents</h1>
            <p className="text-muted-foreground">Monitor and manage security incidents.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingIncident ? 'Edit Incident' : 'Report New Incident'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Flight (Optional)</Label>
                    <Select value={formData.flight_id} onValueChange={(value) => setFormData({ ...formData, flight_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select flight" />
                      </SelectTrigger>
                      <SelectContent>
                        {flights.map((flight) => (
                          <SelectItem key={flight.flight_id} value={flight.flight_id.toString()}>
                            {flight.airline?.airline_code} {flight.flight_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Location</Label>
                    <Input
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Gate A1, Terminal 2"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Incident Time</Label>
                    <Input
                      type="datetime-local"
                      required
                      value={formData.incident_time}
                      onChange={(e) => setFormData({ ...formData, incident_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reported By</Label>
                    <Select value={formData.reported_by_staff_id} onValueChange={(value) => setFormData({ ...formData, reported_by_staff_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((member) => (
                          <SelectItem key={member.staff_id} value={member.staff_id.toString()}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingIncident ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Flight</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Incident Time</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No incidents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  incidents.map((incident) => (
                    <TableRow key={incident.incident_log_id}>
                      <TableCell>
                        <Badge className={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
                      </TableCell>
                      <TableCell>
                        {incident.flight ? `${incident.flight.airline?.airline_code} ${incident.flight.flight_number}` : '-'}
                      </TableCell>
                      <TableCell>{incident.location}</TableCell>
                      <TableCell className="max-w-xs truncate">{incident.description}</TableCell>
                      <TableCell>{new Date(incident.incident_time).toLocaleString()}</TableCell>
                      <TableCell>{incident.staff?.name || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(incident)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(incident.incident_log_id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    
  );
}
