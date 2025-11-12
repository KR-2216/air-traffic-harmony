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
import { Pencil, Trash2, Award } from 'lucide-react';

interface StaffCertification {
  certification_id: number;
  staff_id: number;
  certificate_name: string;
  issuing_authority: string | null;
  issue_date: string;
  expiry_date: string | null;
  staff?: { name: string };
}

interface Staff {
  staff_id: number;
  name: string;
}

export default function StaffCertifications() {
  const [certifications, setCertifications] = useState<StaffCertification[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<StaffCertification | null>(null);

  const [formData, setFormData] = useState({
    staff_id: '',
    certificate_name: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [certRes, staffRes] = await Promise.all([
        supabase.from('staff_certification').select('*, staff(name)').order('expiry_date'),
        supabase.from('staff').select('staff_id, name').order('name'),
      ]);

      if (certRes.error) throw certRes.error;
      if (staffRes.error) throw staffRes.error;

      setCertifications(certRes.data || []);
      setStaff(staffRes.data || []);
    } catch (error: any) {
      toast.error('Failed to fetch data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      staff_id: parseInt(formData.staff_id),
      certificate_name: formData.certificate_name,
      issuing_authority: formData.issuing_authority,
      issue_date: formData.issue_date,
      expiry_date: formData.expiry_date || null,
    };

    try {
      if (editingCert) {
        const { error } = await supabase
          .from('staff_certification')
          .update(data)
          .eq('certification_id', editingCert.certification_id);

        if (error) throw error;
        toast.success('Certification updated successfully');
      } else {
        const { error } = await supabase
          .from('staff_certification')
          .insert([data]);

        if (error) throw error;
        toast.success('Certification created successfully');
      }

      setOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;

    try {
      const { error } = await supabase
        .from('staff_certification')
        .delete()
        .eq('certification_id', id);

      if (error) throw error;
      toast.success('Certification deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete certification: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ staff_id: '', certificate_name: '', issuing_authority: '', issue_date: '', expiry_date: '' });
    setEditingCert(null);
  };

  const openEditDialog = (cert: StaffCertification) => {
    setEditingCert(cert);
    setFormData({
      staff_id: cert.staff_id.toString(),
      certificate_name: cert.certificate_name,
      issuing_authority: cert.issuing_authority || '',
      issue_date: cert.issue_date,
      expiry_date: cert.expiry_date || '',
    });
    setOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setOpen(true);
  };

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Certifications</h1>
        <p className="text-muted-foreground">Track and manage staff certifications and expiry dates.</p>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Award className="mr-2 h-4 w-4" />
              Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCert ? 'Edit Certification' : 'Add New Certification'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Staff Member</Label>
                <Select required value={formData.staff_id} onValueChange={(value) => setFormData({ ...formData, staff_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.staff_id} value={s.staff_id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Certificate Name</Label>
                <Input
                  required
                  value={formData.certificate_name}
                  onChange={(e) => setFormData({ ...formData, certificate_name: e.target.value })}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Issuing Authority</Label>
                <Input
                  value={formData.issuing_authority}
                  onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  required
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCert ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Certifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead>Issuing Authority</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certifications.map((cert) => (
                <TableRow key={cert.certification_id}>
                  <TableCell>{cert.staff?.name}</TableCell>
                  <TableCell className="font-medium">{cert.certificate_name}</TableCell>
                  <TableCell>{cert.issuing_authority || 'N/A'}</TableCell>
                  <TableCell>{new Date(cert.issue_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {cert.expiry_date ? (
                      <span className={isExpired(cert.expiry_date) ? 'text-destructive font-semibold' : ''}>
                        {new Date(cert.expiry_date).toLocaleDateString()}
                        {isExpired(cert.expiry_date) && ' (Expired)'}
                      </span>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(cert)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cert.certification_id)}>
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
