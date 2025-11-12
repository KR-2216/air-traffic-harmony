import { Layout } from '@/components/Layout';

export default function Incidents() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Incidents</h1>
        <p className="text-muted-foreground">Monitor and manage security incidents.</p>
      </div>
    </Layout>
  );
}
