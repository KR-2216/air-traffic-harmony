import { Layout } from '@/components/Layout';

export default function Maintenance() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Maintenance</h1>
        <p className="text-muted-foreground">Track and manage maintenance schedules and logs.</p>
      </div>
    </Layout>
  );
}
