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
import { Pencil, Trash2, Luggage } from 'lucide-react';

interface Baggage {
  baggage_id: number;
  passenger_id: number;
  baggage_type: string;
  weight_kg: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  passenger?: { name: string };
}

interface Passenger {
  passenger_id: number;
  name: string;
}

export default function Baggage() {
  const [baggage, setBaggage] = useState<Baggage[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingBaggage, setEditingBaggage] = useState<Baggage | null>(null);

  const [formData, setFormData] = useState({
    passenger_id: '',
    baggage_type: '',
    weight_kg: '',
    length_cm: '',
    width_cm: '',
    height_cm: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [baggageRes, passengersRes] = await Promise.all([
        supabase.from('baggage').select('*, passenger(name)').order('baggage_id'),
        supabase.from('passenger').select('passenger_id, name').order('name'),
      ]);

      if (baggageRes.error) throw baggageRes.error;
      if (passengersRes.error) throw passengersRes.error;

      setBaggage(baggageRes.data || []);
      setPassengers(passengersRes.data || []);
    } catch (error: any) {
      toast.error('Failed to fetch data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      passenger_id: parseInt(formData.passenger_id),
      baggage_type: formData.baggage_type,
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
      length_cm: formData.length_cm ? parseFloat(formData.length_cm) : null,
      width_cm: formData.width_cm ? parseFloat(formData.width_cm) : null,
      height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
    };

    try {
      if (editingBaggage) {
        const { error } = await supabase
          .from('baggage')
          .update(data)
          .eq('baggage_id', editingBaggage.baggage_id);

        if (error) throw error;
        toast.success('Baggage updated successfully');
      } else {
        const { error } = await supabase
          .from('baggage')
          .insert([data]);

        if (error) throw error;
        toast.success('Baggage created successfully');
      }

      setOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this baggage?')) return;

    try {
      const { error } = await supabase
        .from('baggage')
        .delete()
        .eq('baggage_id', id);

      if (error) throw error;
      toast.success('Baggage deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete baggage: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ passenger_id: '', baggage_type: '', weight_kg: '', length_cm: '', width_cm: '', height_cm: '' });
    setEditingBaggage(null);
  };

  const openEditDialog = (bag: Baggage) => {
    setEditingBaggage(bag);
    setFormData({
      passenger_id: bag.passenger_id.toString(),
      baggage_type: bag.baggage_type,
      weight_kg: bag.weight_kg?.toString() || '',
      length_cm: bag.length_cm?.toString() || '',
      width_cm: bag.width_cm?.toString() || '',
      height_cm: bag.height_cm?.toString() || '',
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
        <h1 className="text-3xl font-bold">Baggage Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Luggage className="mr-2 h-4 w-4" />
              Add Baggage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBaggage ? 'Edit Baggage' : 'Add New Baggage'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Passenger</Label>
                <Select required value={formData.passenger_id} onValueChange={(value) => setFormData({ ...formData, passenger_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select passenger" />
                  </SelectTrigger>
                  <SelectContent>
                    {passengers.map((p) => (
                      <SelectItem key={p.passenger_id} value={p.passenger_id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Baggage Type</Label>
                <Select required value={formData.baggage_type} onValueChange={(value) => setFormData({ ...formData, baggage_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Checked">Checked</SelectItem>
                    <SelectItem value="Carry-on">Carry-on</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  max={32}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label>Length (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.length_cm}
                    onChange={(e) => setFormData({ ...formData, length_cm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Width (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.width_cm}
                    onChange={(e) => setFormData({ ...formData, width_cm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBaggage ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Baggage</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Passenger</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Dimensions (cm)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {baggage.map((bag) => (
                <TableRow key={bag.baggage_id}>
                  <TableCell>{bag.passenger?.name}</TableCell>
                  <TableCell>{bag.baggage_type}</TableCell>
                  <TableCell>{bag.weight_kg || 'N/A'}</TableCell>
                  <TableCell>
                    {bag.length_cm && bag.width_cm && bag.height_cm
                      ? `${bag.length_cm} × ${bag.width_cm} × ${bag.height_cm}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(bag)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(bag.baggage_id)}>
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
