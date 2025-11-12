import { Layout } from '@/components/Layout';

export default function Airports() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Airports</h1>
        <p className="text-muted-foreground">Manage airport locations and terminals.</p>
      </div>
    </Layout>
  );
}
