import { Layout } from '@/components/Layout';

export default function Flights() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Flights Management</h1>
        <p className="text-muted-foreground">Manage and monitor all flights.</p>
      </div>
    </Layout>
  );
}
