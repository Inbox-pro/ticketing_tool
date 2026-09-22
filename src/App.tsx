import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { Dashboard } from './pages/Dashboard';
import { IssuesPage } from './pages/IssuesPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { KanbanBoard } from './pages/KanbanBoard';
import { BacklogPage } from './pages/BacklogPage';
import { SupportCenterPage } from './pages/SupportCenterPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { DocumentationPage } from './pages/DocumentationPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { AppPageId, hasRoleAccessToPage } from './services/rbac';

// Route guard requiring authenticated session
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Route guard for public-only screens like login
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Role-based Access Control guard for specific pages
const RoleRoute: React.FC<{
  pageId: AppPageId;
  children: React.ReactNode;
}> = ({ pageId, children }) => {
  const { currentUser, settings } = useApp();
  const isAllowed = hasRoleAccessToPage(currentUser.role, pageId, settings?.rolePageAccess);

  if (!isAllowed) {
    return <AccessDeniedPage pageId={pageId} />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Application Workspace */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<RoleRoute pageId="dashboard"><Dashboard /></RoleRoute>} />
                    <Route path="/issues" element={<RoleRoute pageId="issues"><IssuesPage /></RoleRoute>} />
                    <Route path="/issues/:id" element={<RoleRoute pageId="issues"><IssueDetailPage /></RoleRoute>} />
                    <Route path="/board" element={<RoleRoute pageId="board"><KanbanBoard /></RoleRoute>} />
                    <Route path="/backlog" element={<RoleRoute pageId="backlog"><BacklogPage /></RoleRoute>} />
                    <Route path="/epics" element={<RoleRoute pageId="backlog"><BacklogPage /></RoleRoute>} />
                    <Route path="/support" element={<RoleRoute pageId="support"><SupportCenterPage /></RoleRoute>} />
                    <Route path="/reports" element={<RoleRoute pageId="reports"><ReportsPage /></RoleRoute>} />
                    <Route path="/projects" element={<RoleRoute pageId="projects"><ProjectsPage /></RoleRoute>} />
                    <Route path="/projects/:id" element={<RoleRoute pageId="projects"><ProjectDetailPage /></RoleRoute>} />
                    <Route path="/team" element={<RoleRoute pageId="team"><TeamPage /></RoleRoute>} />
                    <Route path="/admin" element={<RoleRoute pageId="admin"><AdminPanelPage /></RoleRoute>} />
                    <Route path="/settings" element={<RoleRoute pageId="settings"><SettingsPage /></RoleRoute>} />
                    <Route path="/profile" element={<RoleRoute pageId="profile"><ProfilePage /></RoleRoute>} />
                    <Route path="/docs" element={<RoleRoute pageId="docs"><DocumentationPage /></RoleRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
