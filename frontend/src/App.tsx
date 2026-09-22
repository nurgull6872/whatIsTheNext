import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Layout } from './components/layout/Layout';
import { ToastProvider } from './components/ui';
import {
  CreatePollPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  PollDetailPage,
  ProfilePage,
  RegisterPage,
} from './pages';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="polls/new" element={<CreatePollPage />} />
            <Route path="polls/:id" element={<PollDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
