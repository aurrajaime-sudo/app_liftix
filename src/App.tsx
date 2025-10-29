import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { DeveloperDashboard } from './components/dashboards/DeveloperDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { TechnicianDashboard } from './components/dashboards/TechnicianDashboard';
import { ClientDashboard } from './components/dashboards/ClientDashboard';
import { UserProfile } from './components/UserProfile';
import { ManualsView } from './components/views/ManualsView';
import { MaintenanceView } from './components/views/MaintenanceView';
import { EmergencyView } from './components/views/EmergencyView';
import { EmergencyV2View } from './components/views/EmergencyV2View';
import { WorkOrdersView } from './components/views/WorkOrdersView';
import { RoutesView } from './components/views/RoutesView';
import { QuotationsManagementView } from './components/views/QuotationsManagementView';
import { MaintenanceChecklistView } from './components/views/MaintenanceChecklistView';
import { QRCodesManagementView } from './components/views/QRCodesManagementView';
import { CertificationsDashboard } from './components/views/CertificationsDashboard';
import { PDFHistoryView } from './components/views/PDFHistoryView';
import { StatisticsView } from './components/views/StatisticsView';
import { AuditLogView } from './components/views/AuditLogView';
import { ActivityHistoryView } from './components/views/ActivityHistoryView';
import { BulkOperationsView } from './components/views/BulkOperationsView';

interface DashboardRouterProps {
  onNavigate?: (path: string) => void;
}

function DashboardRouter({ onNavigate }: DashboardRouterProps) {
  const { profile } = useAuth();

  if (!profile) return null;

  switch (profile.role) {
    case 'developer':
      return <DeveloperDashboard onNavigate={onNavigate} />;
    case 'admin':
      return <AdminDashboard onNavigate={onNavigate} />;
    case 'technician':
      return <TechnicianDashboard onNavigate={onNavigate} />;
    case 'client':
      return <ClientDashboard onNavigate={onNavigate} />;
    default:
      return (
        <div className="text-center py-12">
          <p className="text-slate-600">Rol no reconocido</p>
        </div>
      );
  }
}

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <UserProfile />;
      case 'manuals':
        return <ManualsView />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'emergencies':
        return <EmergencyV2View />;
      case 'work-orders':
        return <WorkOrdersView />;
      case 'routes':
        return <RoutesView />;
      case 'quotations':
        return <QuotationsManagementView />;
      case 'maintenance-checklist':
        return <MaintenanceChecklistView />;
      case 'qr-codes':
        return <QRCodesManagementView />;
      case 'certifications':
        return <CertificationsDashboard />;
      case 'pdf-history':
        return <PDFHistoryView />;
      case 'statistics':
        return <StatisticsView />;
      case 'audit-logs':
        return <AuditLogView />;
      case 'activity-history':
        return <ActivityHistoryView />;
      case 'bulk-operations':
        return <BulkOperationsView />;
      case 'dashboard':
      default:
        return <DashboardRouter onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
