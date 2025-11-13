
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

export default function Gates() {
  const [gates, setGates] = useState<any[]>([]);
  const [runways, setRunways] = useState<any[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [airports, setAirports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gateDialogOpen, setGateDialogOpen] = useState(false);
  const [runwayDialogOpen, setRunwayDialogOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<any>(null);
  const [editingRunway, setEditingRunway] = useState<any>(null);
  const [gateFormData, setGateFormData] = useState({
    terminal_id: '',
    gate_name: '',
  });
  const [runwayFormData, setRunwayFormData] = useState({
    airport_id: '',
    runway_name: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [gatesRes, runwaysRes, terminalsRes, airportsRes] = await Promise.all([
      supabase.from('gate').select('*, terminal:terminal_id(*, airport:airport_id(*))').order('gate_name'),
      supabase.from('runway').select('*, airport:airport_id(*)').order('runway_name'),
      supabase.from('terminal').select('*, airport:airport_id(*)'),
      supabase.from('airport').select('*'),
    ]);

    if (gatesRes.data) setGates(gatesRes.data);
    if (runwaysRes.data) setRunways(runwaysRes.data);
    if (terminalsRes.data) setTerminals(terminalsRes.data);
    if (airportsRes.data) setAirports(airportsRes.data);
    setLoading(false);
  };

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGate) {
      const { error } = await supabase
        .from('gate')
        .update(gateFormData)
        .eq('gate_id', editingGate.gate_id);
      
      if (error) {
        toast.error('Failed to update gate');
      } else {
        toast.success('Gate updated successfully');
        setGateDialogOpen(false);
        fetchData();
        resetGateForm();
      }
    } else {
      const { error } = await supabase.from('gate').insert([gateFormData]);
      
      if (error) {
        toast.error('Failed to create gate');
      } else {
        toast.success('Gate created successfully');
        setGateDialogOpen(false);
        fetchData();
        resetGateForm();
      }
    }
  };

  const handleRunwaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRunway) {
      const { error } = await supabase
        .from('runway')
        .update(runwayFormData)
        .eq('runway_id', editingRunway.runway_id);
      
      if (error) {
        toast.error('Failed to update runway');
      } else {
        toast.success('Runway updated successfully');
        setRunwayDialogOpen(false);
        fetchData();
        resetRunwayForm();
      }
    } else {
      const { error } = await supabase.from('runway').insert([runwayFormData]);
      
      if (error) {
        toast.error('Failed to create runway');
      } else {
        toast.success('Runway created successfully');
        setRunwayDialogOpen(false);
        fetchData();
        resetRunwayForm();
      }
    }
  };

  const handleDeleteGate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this gate?')) return;
    
    const { error } = await supabase.from('gate').delete().eq('gate_id', id);
    
    if (error) {
      toast.error('Failed to delete gate');
    } else {
      toast.success('Gate deleted successfully');
      fetchData();
    }
  };

  const handleDeleteRunway = async (id: number) => {
    if (!confirm('Are you sure you want to delete this runway?')) return;
    
    const { error } = await supabase.from('runway').delete().eq('runway_id', id);
    
    if (error) {
      toast.error('Failed to delete runway');
    } else {
      toast.success('Runway deleted successfully');
      fetchData();
    }
  };

  const resetGateForm = () => {
    setGateFormData({
      terminal_id: '',
      gate_name: '',
    });
    setEditingGate(null);
  };

  const resetRunwayForm = () => {
    setRunwayFormData({
      airport_id: '',
      runway_name: '',
    });
    setEditingRunway(null);
  };

  const openEditGateDialog = (gate: any) => {
    setEditingGate(gate);
    setGateFormData({
      terminal_id: gate.terminal_id,
      gate_name: gate.gate_name,
    });
    setGateDialogOpen(true);
  };

  const openEditRunwayDialog = (runway: any) => {
    setEditingRunway(runway);
    setRunwayFormData({
      airport_id: runway.airport_id,
      runway_name: runway.runway_name,
    });
    setRunwayDialogOpen(true);
  };

  return (
    
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gates & Runways</h1>
          <p className="text-muted-foreground">Manage gate and runway assignments.</p>
        </div>

        <Tabs defaultValue="gates" className="w-full">
          <TabsList>
            <TabsTrigger value="gates">Gates</TabsTrigger>
            <TabsTrigger value="runways">Runways</TabsTrigger>
          </TabsList>

          <TabsContent value="gates" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={gateDialogOpen} onOpenChange={(open) => { setGateDialogOpen(open); if (!open) resetGateForm(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Gate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingGate ? 'Edit Gate' : 'Add New Gate'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleGateSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Terminal</Label>
                      <select
                        required
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={gateFormData.terminal_id}
                        onChange={(e) => setGateFormData({ ...gateFormData, terminal_id: e.target.value })}
                      >
                        <option value="">Select terminal</option>
                        {terminals.map((terminal) => (
                          <option key={terminal.terminal_id} value={terminal.terminal_id}>
                            {terminal.airport?.airport_code} - {terminal.terminal_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gate Name</Label>
                      <Input
                        required
                        value={gateFormData.gate_name}
                        onChange={(e) => setGateFormData({ ...gateFormData, gate_name: e.target.value })}
                        placeholder="A1"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setGateDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">{editingGate ? 'Update' : 'Create'}</Button>
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
                      <TableHead>Gate Name</TableHead>
                      <TableHead>Terminal</TableHead>
                      <TableHead>Airport</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No gates found. Add your first gate to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      gates.map((gate) => (
                        <TableRow key={gate.gate_id}>
                          <TableCell className="font-medium">{gate.gate_name}</TableCell>
                          <TableCell>{gate.terminal?.terminal_name}</TableCell>
                          <TableCell>
                            {gate.terminal?.airport?.airport_code} - {gate.terminal?.airport?.airport_name}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => openEditGateDialog(gate)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteGate(gate.gate_id)}>
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

          <TabsContent value="runways" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={runwayDialogOpen} onOpenChange={(open) => { setRunwayDialogOpen(open); if (!open) resetRunwayForm(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Runway
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingRunway ? 'Edit Runway' : 'Add New Runway'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRunwaySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Airport</Label>
                      <select
                        required
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={runwayFormData.airport_id}
                        onChange={(e) => setRunwayFormData({ ...runwayFormData, airport_id: e.target.value })}
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
                      <Label>Runway Name</Label>
                      <Input
                        required
                        value={runwayFormData.runway_name}
                        onChange={(e) => setRunwayFormData({ ...runwayFormData, runway_name: e.target.value })}
                        placeholder="09R/27L"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setRunwayDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">{editingRunway ? 'Update' : 'Create'}</Button>
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
                      <TableHead>Runway Name</TableHead>
                      <TableHead>Airport</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runways.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No runways found. Add your first runway to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      runways.map((runway) => (
                        <TableRow key={runway.runway_id}>
                          <TableCell className="font-medium">{runway.runway_name}</TableCell>
                          <TableCell>
                            {runway.airport?.airport_code} - {runway.airport?.airport_name}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => openEditRunwayDialog(runway)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteRunway(runway.runway_id)}>
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
