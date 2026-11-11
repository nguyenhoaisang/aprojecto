import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';

// lazy: mỗi trang chỉ được tải khi người dùng mở trang đó (giúp web tải nhanh hơn)
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Overview = lazy(() => import('./pages/Overview/Overview'));
const AllProjects = lazy(() => import('./pages/AllProjects/AllProjects'));
const CreateProject = lazy(() => import('./pages/CreateProject/CreateProject'));
const EditProject = lazy(() => import('./pages/EditProject/EditProject'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails/ProjectDetails'));
const CreateTask = lazy(() => import('./pages/CreateTask/CreateTask'));
const Tasks = lazy(() => import('./pages/Tasks/Tasks'));
const SubTasks = lazy(() => import('./pages/SubTasks/SubTasks'));
const CreateSubTask = lazy(() => import('./pages/CreateSubTask/CreateSubTask'));
const CreateUser = lazy(() => import('./pages/CreateUser/CreateUser'));
const Performance = lazy(() => import('./pages/Performance/Performance'));
const WorkLogs = lazy(() => import('./pages/WorkLogs/WorkLogs'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Settings = lazy(() => import('./pages/Settings/Settings'));

// Rút gọn: bọc 1 trang bằng ProtectedRoute chỉ cho Leader vào
function leaderOnly(page) {
  return <ProtectedRoute roles={['leader']}>{page}</ProtectedRoute>;
}

function App() {
  return (
    <Suspense fallback={<p style={{ padding: 40 }}>Đang tải...</p>}>
      <Routes>
        {/* Trang công khai */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Các trang cần đăng nhập: dùng chung Layout (header + sidebar) */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<AllProjects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/work-logs" element={<WorkLogs />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />

          {/* Chỉ Leader được vào */}
          <Route path="/overview" element={leaderOnly(<Overview />)} />
          <Route path="/projects/create" element={leaderOnly(<CreateProject />)} />
          <Route path="/projects/:id/edit" element={leaderOnly(<EditProject />)} />
          <Route path="/projects/:id/tasks/create" element={leaderOnly(<CreateTask />)} />
          <Route path="/tasks/:taskId" element={leaderOnly(<SubTasks />)} />
          <Route path="/tasks/:taskId/subtasks/create" element={leaderOnly(<CreateSubTask />)} />
          <Route path="/users/create" element={leaderOnly(<CreateUser />)} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
