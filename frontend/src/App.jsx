import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard.jsx';
import HtmlPreview from './components/agent/htmlpreview.jsx';
import ProtectedRoute from './Protected.jsx';
import Devices from './components/devices/device.jsx';
import ProtectedLayout from './ProtectedLayout.jsx';
import NotifyProvider from './components/Device-IDE/notify.jsx';
import { Router } from 'lucide-react';
import Landing from './components/landing/landing.jsx';
import Agent from './components/agent/agent.jsx';
import CarController from './pages/carController.jsx';
import FailedRoute from './failedroute.jsx';
import AuthPage from './pages/login.jsx';
import Profile from './components/profile/profile.jsx';
import Inventory from './components/project/invetory.jsx';
import Show from './components/project_ui/show.jsx';
import Setting from './setting/setting.jsx';

export default function App() {
  return (
    <NotifyProvider>
      <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthPage />} />
          <Route element={<ProtectedRoute/>}>
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />}/>
              <Route path="/devices" element={<Devices />}/>
              <Route path="/codePreview" element={<HtmlPreview />}/>
              <Route path="/agent" element={<Agent/>} />
              <Route path="/settings" element={<Setting/>}/>
              <Route path="/profile" element={<Profile/>}></Route>
              <Route path="/inventory" element={<Inventory/>}></Route>
            </Route>
            <Route path="/project/:project_id" element={<Show/>}></Route>
          </Route>
          <Route path="*" element={<FailedRoute />} />
      </Routes>
    </NotifyProvider>
  )
}
