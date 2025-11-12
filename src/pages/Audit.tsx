import { Layout } from '@/components/Layout';

export default function Audit() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Audit Log</h1>
        <p className="text-muted-foreground">View system audit logs and changes.</p>
      </div>
    </Layout>
  );
}
