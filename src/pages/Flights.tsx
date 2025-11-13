
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function Flights() {
  const [flights, setFlights] = useState<any[]>([]);
  const [airports, setAirports] = useState<any[]>([]);
  const [airlines, setAirlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [airlineDialogOpen, setAirlineDialogOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<any>(null);
  const [editingAirline, setEditingAirline] = useState<any>(null);
  const [formData, setFormData] = useState({
    flight_number: '',
    airline_id: '',
    departure_airport_id: '',
    arrival_airport_id: '',
    scheduled_departure_time: '',
    scheduled_arrival_time: '',
    status: 'Scheduled',
  });
  const [airlineFormData, setAirlineFormData] = useState({
    airline_name: '',
    airline_code: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [flightsRes, airportsRes, airlinesRes] = await Promise.all([
      supabase.from('flight').select('*, airline:airline_id(*), departure:departure_airport_id(*), arrival:arrival_airport_id(*)').order('scheduled_departure_time', { ascending: false }),
      supabase.from('airport').select('*'),
      supabase.from('airline').select('*'),
    ]);

    if (flightsRes.data) setFlights(flightsRes.data);
    if (airportsRes.data) setAirports(airportsRes.data);
    if (airlinesRes.data) setAirlines(airlinesRes.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      airline_id: formData.airline_id ? Number(formData.airline_id) : null,
      departure_airport_id: formData.departure_airport_id ? Number(formData.departure_airport_id) : null,
      arrival_airport_id: formData.arrival_airport_id ? Number(formData.arrival_airport_id) : null,
      flight_date: formData.scheduled_departure_time ? formData.scheduled_departure_time.slice(0, 10) : null,
    };
    
    if (editingFlight) {
      const { error } = await supabase
        .from('flight')
        .update(payload)
        .eq('flight_id', editingFlight.flight_id);
      
      if (error) {
        toast.error('Failed to update flight');
      } else {
        toast.success('Flight updated successfully');
        setDialogOpen(false);
        fetchData();
        resetForm();
      }
    } else {
      const { error } = await supabase.from('flight').insert([payload]);
      
      if (error) {
        toast.error('Failed to create flight');
      } else {
        toast.success('Flight created successfully');
        setDialogOpen(false);
        fetchData();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flight?')) return;
    
    const { error } = await supabase.from('flight').delete().eq('flight_id', id);
    
    if (error) {
      toast.error('Failed to delete flight');
    } else {
      toast.success('Flight deleted successfully');
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({
      flight_number: '',
      airline_id: '',
      departure_airport_id: '',
      arrival_airport_id: '',
      scheduled_departure_time: '',
      scheduled_arrival_time: '',
      status: 'Scheduled',
    });
    setEditingFlight(null);
  };

  const openEditDialog = (flight: any) => {
    setEditingFlight(flight);
    setFormData({
      flight_number: flight.flight_number,
      airline_id: String(flight.airline_id || ''),
      departure_airport_id: String(flight.departure_airport_id || ''),
      arrival_airport_id: String(flight.arrival_airport_id || ''),
      scheduled_departure_time: flight.scheduled_departure_time?.slice(0, 16) || '',
      scheduled_arrival_time: flight.scheduled_arrival_time?.slice(0, 16) || '',
      status: flight.status,
    });
    setDialogOpen(true);
  };

  const handleAirlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate airline code length
    if (airlineFormData.airline_code.length !== 3) {
      toast.error('Airline code must be exactly 3 characters');
      return;
    }
    
    if (editingAirline) {
      const { error } = await supabase
        .from('airline')
        .update(airlineFormData)
        .eq('airline_id', editingAirline.airline_id);
      
      if (error) {
        console.error('Airline update error:', error);
        toast.error(error.message || 'Failed to update airline');
      } else {
        toast.success('Airline updated successfully');
        setAirlineDialogOpen(false);
        fetchData();
        resetAirlineForm();
      }
    } else {
      const { error } = await supabase.from('airline').insert([airlineFormData]);
      
      if (error) {
        console.error('Airline create error:', error);
        toast.error(error.message || 'Failed to create airline');
      } else {
        toast.success('Airline created successfully');
        setAirlineDialogOpen(false);
        fetchData();
        resetAirlineForm();
      }
    }
  };

  const handleDeleteAirline = async (id: number) => {
    if (!confirm('Are you sure you want to delete this airline?')) return;
    
    const { error } = await supabase.from('airline').delete().eq('airline_id', id);
    
    if (error) {
      toast.error('Failed to delete airline');
    } else {
      toast.success('Airline deleted successfully');
      fetchData();
    }
  };

  const resetAirlineForm = () => {
    setAirlineFormData({
      airline_name: '',
      airline_code: '',
      email: '',
      phone: '',
    });
    setEditingAirline(null);
  };

  const openEditAirlineDialog = (airline: any) => {
    setEditingAirline(airline);
    setAirlineFormData({
      airline_name: airline.airline_name,
      airline_code: airline.airline_code,
      email: airline.email || '',
      phone: airline.phone || '',
    });
    setAirlineDialogOpen(true);
  };

  return (
    
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Flights & Airlines</h1>
          <p className="text-muted-foreground">Manage flights and airline information.</p>
        </div>

        <Tabs defaultValue="flights" className="w-full">
          <TabsList>
            <TabsTrigger value="flights">Flights</TabsTrigger>
            <TabsTrigger value="airlines">Airlines</TabsTrigger>
          </TabsList>

          <TabsContent value="flights" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Flight
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingFlight ? 'Edit Flight' : 'Add New Flight'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Flight Number</Label>
                        <Input
                          required
                          value={formData.flight_number}
                          onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Airline</Label>
                        <Select value={formData.airline_id} onValueChange={(value) => setFormData({ ...formData, airline_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select airline" />
                          </SelectTrigger>
                          <SelectContent>
                            {airlines.map((airline) => (
                              <SelectItem key={airline.airline_id} value={airline.airline_id}>
                                {airline.airline_name} ({airline.airline_code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Departure Airport</Label>
                        <Select value={formData.departure_airport_id} onValueChange={(value) => setFormData({ ...formData, departure_airport_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select airport" />
                          </SelectTrigger>
                          <SelectContent>
                            {airports.map((airport) => (
                              <SelectItem key={airport.airport_id} value={airport.airport_id}>
                                {airport.airport_name} ({airport.airport_code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Arrival Airport</Label>
                        <Select value={formData.arrival_airport_id} onValueChange={(value) => setFormData({ ...formData, arrival_airport_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select airport" />
                          </SelectTrigger>
                          <SelectContent>
                            {airports.map((airport) => (
                              <SelectItem key={airport.airport_id} value={airport.airport_id}>
                                {airport.airport_name} ({airport.airport_code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Scheduled Departure</Label>
                        <Input
                          type="datetime-local"
                          required
                          value={formData.scheduled_departure_time}
                          onChange={(e) => setFormData({ ...formData, scheduled_departure_time: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Scheduled Arrival</Label>
                        <Input
                          type="datetime-local"
                          required
                          value={formData.scheduled_arrival_time}
                          onChange={(e) => setFormData({ ...formData, scheduled_arrival_time: e.target.value })}
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
                            <SelectItem value="On Time">On Time</SelectItem>
                            <SelectItem value="Delayed">Delayed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                            <SelectItem value="Departed">Departed</SelectItem>
                            <SelectItem value="Arrived">Arrived</SelectItem>
                            <SelectItem value="Boarding">Boarding</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">{editingFlight ? 'Update' : 'Create'}</Button>
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
                      <TableHead>Flight Number</TableHead>
                      <TableHead>Airline</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Arrival</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flights.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No flights found. Add your first flight to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      flights.map((flight) => (
                        <TableRow key={flight.flight_id}>
                          <TableCell className="font-medium">{flight.flight_number}</TableCell>
                          <TableCell>{flight.airline?.airline_name}</TableCell>
                          <TableCell>
                            {flight.departure?.airport_code} → {flight.arrival?.airport_code}
                          </TableCell>
                          <TableCell>{new Date(flight.scheduled_departure_time).toLocaleString()}</TableCell>
                          <TableCell>{new Date(flight.scheduled_arrival_time).toLocaleString()}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-foreground">
                              {flight.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => openEditDialog(flight)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(flight.flight_id)}>
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
          </TabsContent>

          <TabsContent value="airlines" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={airlineDialogOpen} onOpenChange={(open) => { setAirlineDialogOpen(open); if (!open) resetAirlineForm(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Airline
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingAirline ? 'Edit Airline' : 'Add New Airline'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAirlineSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Airline Name</Label>
                      <Input
                        required
                        value={airlineFormData.airline_name}
                        onChange={(e) => setAirlineFormData({ ...airlineFormData, airline_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ICAO Code</Label>
                      <Input
                        required
                        maxLength={3}
                        minLength={3}
                        pattern="[A-Z]{3}"
                        value={airlineFormData.airline_code}
                        onChange={(e) => setAirlineFormData({ ...airlineFormData, airline_code: e.target.value.toUpperCase() })}
                        placeholder="AAL"
                      />
                      <p className="text-xs text-muted-foreground">Must be exactly 3 uppercase letters</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={airlineFormData.email}
                        onChange={(e) => setAirlineFormData({ ...airlineFormData, email: e.target.value })}
                        placeholder="contact@airline.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        value={airlineFormData.phone}
                        onChange={(e) => setAirlineFormData({ ...airlineFormData, phone: e.target.value })}
                        placeholder="+1-800-123-4567"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setAirlineDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">{editingAirline ? 'Update' : 'Create'}</Button>
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
                      <TableHead>Airline Name</TableHead>
                      <TableHead>ICAO Code</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {airlines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No airlines found. Add your first airline to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      airlines.map((airline) => (
                        <TableRow key={airline.airline_id}>
                          <TableCell className="font-medium">{airline.airline_name}</TableCell>
                          <TableCell>{airline.airline_code}</TableCell>
                          <TableCell>{airline.email || '-'}</TableCell>
                          <TableCell>{airline.phone || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => openEditAirlineDialog(airline)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteAirline(airline.airline_id)}>
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
          </TabsContent>
        </Tabs>
      </div>
    
  );
}
