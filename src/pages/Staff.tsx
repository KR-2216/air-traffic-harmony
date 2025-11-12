import { Layout } from '@/components/Layout';

export default function Staff() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
        <p className="text-muted-foreground">Manage staff, certifications, and crew assignments.</p>
      </div>
    </Layout>
  );
}
