import { Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppLayout from '@/components/AppLayout';
import Overview from '@/pages/Overview';
import Projects from '@/pages/Projects';
import Analytics from '@/pages/Analytics';
import Domains from '@/pages/Domains';
import Settings from '@/pages/Settings';
import EnvVars from '@/pages/EnvVars';
import GitHubConnect from '@/pages/GitHubConnect';
import NewDeployment from '@/pages/NewDeployment';
import ProjectDetail from '@/pages/ProjectDetail';

function App() {
  return (
    <SidebarProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/domains" element={<Domains />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/env-vars/:projectId" element={<EnvVars />} />
          <Route path="/github-connect" element={<GitHubConnect />} />
          <Route path="/deploy" element={<NewDeployment />} />
        </Route>
      </Routes>
    </SidebarProvider>
  );
}

export default App;
