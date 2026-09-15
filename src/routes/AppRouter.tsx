import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Public & Auth Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import SignUp from '../pages/auth/SignUp';
import Unauthorized from '../pages/Unauthorized';
import WorkerSelect from '../pages/WorkerSelect';
import CampusUserSelect from '../pages/CampusUserSelect';

// App Pages
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/AdminDashboard';
import StudentPage from '../pages/StudentPage';
import TeacherPage from '../pages/TeacherPage';
import FacultyPage from '../pages/FacultyPage';
import MedicalPage from '../pages/MedicalPage';
import FirePage from '../pages/FirePage';
import SecurityPage from '../pages/SecurityPage';
import EmergencyPage from '../pages/EmergencyPage';
import RidesPage from '../pages/RidesPage';
import LostFoundPage from '../pages/LostFoundPage';
import SafetyMapPage from '../pages/SafetyMapPage';
import NotificationsPage from '../pages/NotificationsPage';
import ProfilePage from '../pages/ProfilePage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/worker-select" element={<WorkerSelect />} />
          <Route path="/campus-user-select" element={<CampusUserSelect />} />

          {/* ================= PROTECTED COMMON ROUTES ================= */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/rides" element={<RidesPage />} />
            <Route path="/lost-found" element={<LostFoundPage />} />
            <Route path="/safety-map" element={<SafetyMapPage />} />
            <Route path="/map" element={<SafetyMapPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/worker" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* ================= ROLE SPECIFIC ROUTES ================= */}
          {/* Admin */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Campus Users */}
          <Route element={<RoleRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentPage />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher" element={<TeacherPage />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['faculty']} />}>
            <Route path="/faculty" element={<FacultyPage />} />
          </Route>

          {/* Workers */}
          <Route element={<RoleRoute allowedRoles={['medical']} />}>
            <Route path="/medical" element={<MedicalPage />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['fire']} />}>
            <Route path="/fire" element={<FirePage />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['security']} />}>
            <Route path="/security" element={<SecurityPage />} />
          </Route>

          {/* Catch-all — redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
