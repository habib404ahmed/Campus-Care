import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { MapContainer } from '../components/MapContainer';

export default function MapPage() {
  return (
    <DashboardLayout unreadNotifications={2}>
      <PageHeader
        title="Campus Map"
        subtitle="Live campus safety map — real map integration coming in Phase 2"
      />
      <MapContainer height="h-[calc(100vh-16rem)]" showLegend />
    </DashboardLayout>
  );
}
