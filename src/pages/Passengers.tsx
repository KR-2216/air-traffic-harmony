import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, Trash2, UserPlus } from 'lucide-react';

interface Passenger {
  passenger_id: number;
  name: string;
  email: string;
  phone: string;
}

export default function Passengers() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async () => {
    try {
      const { data, error } = await supabase
        .from('passenger')
        .select('*')
        .order('name');

      if (error) throw error;
      setPassengers(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch passengers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPassenger) {
        const { error } = await supabase
          .from('passenger')
          .update(formData)
          .eq('passenger_id', editingPassenger.passenger_id);

        if (error) throw error;
        toast.success('Passenger updated successfully');
      } else {
        const { error } = await supabase
          .from('passenger')
          .insert([formData]);

        if (error) throw error;
        toast.success('Passenger created successfully');
      }

      setOpen(false);
      resetForm();
      fetchPassengers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this passenger?')) return;

    try {
      const { error } = await supabase
        .from('passenger')
        .delete()
        .eq('passenger_id', id);

      if (error) throw error;
      toast.success('Passenger deleted successfully');
      fetchPassengers();
    } catch (error: any) {
      toast.error('Failed to delete passenger: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '' });
    setEditingPassenger(null);
  };

  const openEditDialog = (passenger: Passenger) => {
    setEditingPassenger(passenger);
    setFormData({
      name: passenger.name,
      email: passenger.email,
      phone: passenger.phone || '',
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Passenger Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Passenger
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPassenger ? 'Edit Passenger' : 'Add New Passenger'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  maxLength={20}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPassenger ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Passengers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passengers.map((passenger) => (
                <TableRow key={passenger.passenger_id}>
                  <TableCell>{passenger.name}</TableCell>
                  <TableCell>{passenger.email}</TableCell>
                  <TableCell>{passenger.phone || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(passenger)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(passenger.passenger_id)}
                      >
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
