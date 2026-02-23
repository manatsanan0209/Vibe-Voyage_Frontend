import { Route, Routes } from 'react-router-dom';

import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import Home from './page/Home';
import Profile from './page/Profile';
import NotFound from './page/NotFound';
import SignIn from './page/SignIn';
import SignUp from './page/SignUp';

export function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="*" element={<NotFound />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
