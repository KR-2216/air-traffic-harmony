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

export default function Airports() {
  const [airports, setAirports] = useState<any[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [terminalDialogOpen, setTerminalDialogOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState<any>(null);
  const [editingTerminal, setEditingTerminal] = useState<any>(null);
  const [airportFormData, setAirportFormData] = useState({
    airport_code: '',
    airport_name: '',
    location: '',
    email: '',
    phone: '',
  });
  const [terminalFormData, setTerminalFormData] = useState({
    airport_id: '',
    terminal_name: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [airportsRes, terminalsRes] = await Promise.all([
      supabase.from('airport').select('*').order('airport_code'),
      supabase.from('terminal').select('*, airport:airport_id(*)').order('terminal_name'),
    ]);

    if (airportsRes.data) setAirports(airportsRes.data);
    if (terminalsRes.data) setTerminals(terminalsRes.data);
    setLoading(false);
  };

  const handleAirportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAirport) {
      const { error } = await supabase
        .from('airport')
        .update(airportFormData)
        .eq('airport_id', editingAirport.airport_id);
      
      if (error) {
        toast.error('Failed to update airport');
      } else {
        toast.success('Airport updated successfully');
        setDialogOpen(false);
        fetchData();
        resetAirportForm();
      }
    } else {
      const { error } = await supabase.from('airport').insert([airportFormData]);
      
      if (error) {
        toast.error('Failed to create airport');
      } else {
        toast.success('Airport created successfully');
        setDialogOpen(false);
        fetchData();
        resetAirportForm();
      }
    }
  };

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTerminal) {
      const { error } = await supabase
        .from('terminal')
        .update(terminalFormData)
        .eq('terminal_id', editingTerminal.terminal_id);
      
      if (error) {
        toast.error('Failed to update terminal');
      } else {
        toast.success('Terminal updated successfully');
        setTerminalDialogOpen(false);
        fetchData();
        resetTerminalForm();
      }
    } else {
      const { error } = await supabase.from('terminal').insert([terminalFormData]);
      
      if (error) {
        toast.error('Failed to create terminal');
      } else {
        toast.success('Terminal created successfully');
        setTerminalDialogOpen(false);
        fetchData();
        resetTerminalForm();
      }
    }
  };

  const handleDeleteAirport = async (id: number) => {
    if (!confirm('Are you sure you want to delete this airport?')) return;
    
    const { error } = await supabase.from('airport').delete().eq('airport_id', id);
    
    if (error) {
      toast.error('Failed to delete airport');
    } else {
      toast.success('Airport deleted successfully');
      fetchData();
    }
  };

  const handleDeleteTerminal = async (id: number) => {
    if (!confirm('Are you sure you want to delete this terminal?')) return;
    
    const { error } = await supabase.from('terminal').delete().eq('terminal_id', id);
    
    if (error) {
      toast.error('Failed to delete terminal');
    } else {
      toast.success('Terminal deleted successfully');
      fetchData();
    }
  };

  const resetAirportForm = () => {
    setAirportFormData({
      airport_code: '',
      airport_name: '',
      location: '',
      email: '',
      phone: '',
    });
    setEditingAirport(null);
  };

  const resetTerminalForm = () => {
    setTerminalFormData({
      airport_id: '',
      terminal_name: '',
    });
    setEditingTerminal(null);
  };

  const openEditAirportDialog = (airport: any) => {
    setEditingAirport(airport);
    setAirportFormData({
      airport_code: airport.airport_code,
      airport_name: airport.airport_name,
      location: airport.location || '',
      email: airport.email || '',
      phone: airport.phone || '',
    });
    setDialogOpen(true);
  };

  const openEditTerminalDialog = (terminal: any) => {
    setEditingTerminal(terminal);
    setTerminalFormData({
      airport_id: terminal.airport_id,
      terminal_name: terminal.terminal_name,
    });
    setTerminalDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Airports & Terminals</h1>
          <p className="text-muted-foreground">Manage airport locations and terminals.</p>
        </div>

        <Tabs defaultValue="airports" className="w-full">
          <TabsList>
            <TabsTrigger value="airports">Airports</TabsTrigger>
            <TabsTrigger value="terminals">Terminals</TabsTrigger>
          </TabsList>

          <TabsContent value="airports" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetAirportForm(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Airport
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingAirport ? 'Edit Airport' : 'Add New Airport'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAirportSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Airport Code (3 letters)</Label>
                        <Input
                          required
                          maxLength={3}
                          value={airportFormData.airport_code}
                          onChange={(e) => setAirportFormData({ ...airportFormData, airport_code: e.target.value.toUpperCase() })}
                          placeholder="JFK"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Airport Name</Label>
                        <Input
                          required
                          value={airportFormData.airport_name}
                          onChange={(e) => setAirportFormData({ ...airportFormData, airport_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Location</Label>
                        <Input
                          value={airportFormData.location}
                          onChange={(e) => setAirportFormData({ ...airportFormData, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={airportFormData.email}
                          onChange={(e) => setAirportFormData({ ...airportFormData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          type="tel"
                          value={airportFormData.phone}
                          onChange={(e) => setAirportFormData({ ...airportFormData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">{editingAirport ? 'Update' : 'Create'}</Button>
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
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {airports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No airports found. Add your first airport to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      airports.map((airport) => (
                        <TableRow key={airport.airport_id}>
                          <TableCell className="font-medium">{airport.airport_code}</TableCell>
                          <TableCell>{airport.airport_name}</TableCell>
                          <TableCell>{airport.location || '-'}</TableCell>
                          <TableCell>{airport.email || '-'}</TableCell>
                          <TableCell>{airport.phone || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => openEditAirportDialog(airport)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteAirport(airport.airport_id)}>
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

          <TabsContent value="terminals" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={terminalDialogOpen} onOpenChange={(open) => { setTerminalDialogOpen(open); if (!open) resetTerminalForm(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Terminal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingTerminal ? 'Edit Terminal' : 'Add New Terminal'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleTerminalSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Airport</Label>
                      <select
                        required
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={terminalFormData.airport_id}
                        onChange={(e) => setTerminalFormData({ ...terminalFormData, airport_id: e.target.value })}
                      >
                        <option value="">Select airport</option>
                        {airports.map((airport) => (
                          <option key={airport.airport_id} value={airport.airport_id}>
                            {airport.airport_code} - {airport.airport_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Terminal Name</Label>
                      <Input
                        required
                        value={terminalFormData.terminal_name}
                        onChange={(e) => setTerminalFormData({ ...terminalFormData, terminal_name: e.target.value })}
                        placeholder="Terminal A"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setTerminalDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">{editingTerminal ? 'Update' : 'Create'}</Button>
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
                      <TableHead>Terminal Name</TableHead>
                      <TableHead>Airport</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {terminals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No terminals found. Add your first terminal to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      terminals.map((terminal) => (
                        <TableRow key={terminal.terminal_id}>
                          <TableCell className="font-medium">{terminal.terminal_name}</TableCell>
                          <TableCell>
                            {terminal.airport?.airport_code} - {terminal.airport?.airport_name}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => openEditTerminalDialog(terminal)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteTerminal(terminal.terminal_id)}>
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
    </Layout>
  );
}
