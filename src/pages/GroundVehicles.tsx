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
import { Pencil, Trash2, Truck } from 'lucide-react';

interface GroundVehicle {
  vehicle_id: number;
  airport_id: number;
  vehicle_type: string;
  registration_number: string;
  status: string;
  airport?: { airport_name: string };
}

interface Airport {
  airport_id: number;
  airport_name: string;
}

export default function GroundVehicles() {
  const [vehicles, setVehicles] = useState<GroundVehicle[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<GroundVehicle | null>(null);

  const [formData, setFormData] = useState({
    airport_id: '',
    vehicle_type: '',
    registration_number: '',
    status: 'Operational',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, airportsRes] = await Promise.all([
        supabase.from('ground_vehicle').select('*, airport(airport_name)').order('vehicle_id'),
        supabase.from('airport').select('airport_id, airport_name').order('airport_name'),
      ]);

      if (vehiclesRes.error) throw vehiclesRes.error;
      if (airportsRes.error) throw airportsRes.error;

      setVehicles(vehiclesRes.data || []);
      setAirports(airportsRes.data || []);
    } catch (error: any) {
      toast.error('Failed to fetch data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      airport_id: parseInt(formData.airport_id),
      vehicle_type: formData.vehicle_type,
      registration_number: formData.registration_number,
      status: formData.status,
    };

    try {
      if (editingVehicle) {
        const { error } = await supabase
          .from('ground_vehicle')
          .update(data)
          .eq('vehicle_id', editingVehicle.vehicle_id);

        if (error) throw error;
        toast.success('Vehicle updated successfully');
      } else {
        const { error } = await supabase
          .from('ground_vehicle')
          .insert([data]);

        if (error) throw error;
        toast.success('Vehicle created successfully');
      }

      setOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const { error } = await supabase
        .from('ground_vehicle')
        .delete()
        .eq('vehicle_id', id);

      if (error) throw error;
      toast.success('Vehicle deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete vehicle: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ airport_id: '', vehicle_type: '', registration_number: '', status: 'Operational' });
    setEditingVehicle(null);
  };

  const openEditDialog = (vehicle: GroundVehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      airport_id: vehicle.airport_id.toString(),
      vehicle_type: vehicle.vehicle_type,
      registration_number: vehicle.registration_number,
      status: vehicle.status,
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
        <h1 className="text-3xl font-bold">Ground Vehicles</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Truck className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Airport</Label>
                <Select required value={formData.airport_id} onValueChange={(value) => setFormData({ ...formData, airport_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select airport" />
                  </SelectTrigger>
                  <SelectContent>
                    {airports.map((a) => (
                      <SelectItem key={a.airport_id} value={a.airport_id.toString()}>
                        {a.airport_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vehicle Type</Label>
                <Input
                  required
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  maxLength={50}
                  placeholder="e.g., Baggage Tractor, Fuel Truck"
                />
              </div>
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input
                  required
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operational">Operational</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Out of Service">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingVehicle ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ground Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Registration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Airport</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.vehicle_id}>
                  <TableCell className="font-medium">{vehicle.registration_number}</TableCell>
                  <TableCell>{vehicle.vehicle_type}</TableCell>
                  <TableCell>{vehicle.airport?.airport_name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      vehicle.status === 'Operational' ? 'bg-green-100 text-green-800' :
                      vehicle.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(vehicle)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(vehicle.vehicle_id)}>
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
