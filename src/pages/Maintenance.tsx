import { Layout } from '@/components/Layout';
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

export default function Maintenance() {
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [formData, setFormData] = useState({
    resource_type: '',
    resource_id: '',
    description: '',
    scheduled_start_time: '',
    scheduled_end_time: '',
    actual_start_time: '',
    actual_end_time: '',
    status: 'Scheduled',
    assigned_staff_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [logsRes, staffRes] = await Promise.all([
      supabase.from('maintenance_log').select('*, staff:assigned_staff_id(*)').order('scheduled_start_time', { ascending: false }),
      supabase.from('staff').select('*'),
    ]);

    if (logsRes.data) setMaintenanceLogs(logsRes.data);
    if (staffRes.data) setStaff(staffRes.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      resource_id: parseInt(formData.resource_id),
      assigned_staff_id: formData.assigned_staff_id ? parseInt(formData.assigned_staff_id) : null,
      actual_start_time: formData.actual_start_time || null,
      actual_end_time: formData.actual_end_time || null,
    };

    if (editingLog) {
      const { error } = await supabase
        .from('maintenance_log')
        .update(submitData)
        .eq('maintenance_log_id', editingLog.maintenance_log_id);
      
      if (error) {
        toast.error('Failed to update maintenance log');
      } else {
        toast.success('Maintenance log updated successfully');
        setDialogOpen(false);
        fetchData();
        resetForm();
      }
    } else {
      const { error } = await supabase.from('maintenance_log').insert([submitData]);
      
      if (error) {
        toast.error('Failed to create maintenance log');
      } else {
        toast.success('Maintenance log created successfully');
        setDialogOpen(false);
        fetchData();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this maintenance log?')) return;
    
    const { error } = await supabase.from('maintenance_log').delete().eq('maintenance_log_id', id);
    
    if (error) {
      toast.error('Failed to delete maintenance log');
    } else {
      toast.success('Maintenance log deleted successfully');
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({
      resource_type: '',
      resource_id: '',
      description: '',
      scheduled_start_time: '',
      scheduled_end_time: '',
      actual_start_time: '',
      actual_end_time: '',
      status: 'Scheduled',
      assigned_staff_id: '',
    });
    setEditingLog(null);
  };

  const openEditDialog = (log: any) => {
    setEditingLog(log);
    setFormData({
      resource_type: log.resource_type,
      resource_id: log.resource_id?.toString() || '',
      description: log.description || '',
      scheduled_start_time: log.scheduled_start_time?.slice(0, 16) || '',
      scheduled_end_time: log.scheduled_end_time?.slice(0, 16) || '',
      actual_start_time: log.actual_start_time?.slice(0, 16) || '',
      actual_end_time: log.actual_end_time?.slice(0, 16) || '',
      status: log.status,
      assigned_staff_id: log.assigned_staff_id?.toString() || '',
    });
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-success text-success-foreground';
      case 'In Progress': return 'bg-warning text-warning-foreground';
      case 'Cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Maintenance</h1>
            <p className="text-muted-foreground">Track and manage maintenance schedules and logs.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Maintenance Log
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingLog ? 'Edit Maintenance Log' : 'Add New Maintenance Log'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resource Type</Label>
                    <Select value={formData.resource_type} onValueChange={(value) => setFormData({ ...formData, resource_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gate">Gate</SelectItem>
                        <SelectItem value="Runway">Runway</SelectItem>
                        <SelectItem value="Ground Vehicle">Ground Vehicle</SelectItem>
                        <SelectItem value="Aircraft">Aircraft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Resource ID</Label>
                    <Input
                      type="number"
                      required
                      value={formData.resource_id}
                      onChange={(e) => setFormData({ ...formData, resource_id: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned Staff</Label>
                    <Select value={formData.assigned_staff_id} onValueChange={(value) => setFormData({ ...formData, assigned_staff_id: value })}>
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
                  <div className="space-y-2">
                    <Label>Scheduled Start</Label>
                    <Input
                      type="datetime-local"
                      required
                      value={formData.scheduled_start_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Scheduled End</Label>
                    <Input
                      type="datetime-local"
                      required
                      value={formData.scheduled_end_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_end_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Actual Start</Label>
                    <Input
                      type="datetime-local"
                      value={formData.actual_start_time}
                      onChange={(e) => setFormData({ ...formData, actual_start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Actual End</Label>
                    <Input
                      type="datetime-local"
                      value={formData.actual_end_time}
                      onChange={(e) => setFormData({ ...formData, actual_end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingLog ? 'Update' : 'Create'}</Button>
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
                  <TableHead>Resource Type</TableHead>
                  <TableHead>Resource ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Staff</TableHead>
                  <TableHead>Scheduled Start</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No maintenance logs found. Add your first log to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  maintenanceLogs.map((log) => (
                    <TableRow key={log.maintenance_log_id}>
                      <TableCell className="font-medium">{log.resource_type}</TableCell>
                      <TableCell>{log.resource_id}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                      </TableCell>
                      <TableCell>{log.staff?.name || '-'}</TableCell>
                      <TableCell>{new Date(log.scheduled_start_time).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(log)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(log.maintenance_log_id)}>
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
    </Layout>
  );
}
