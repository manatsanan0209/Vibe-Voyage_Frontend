import { Route, Routes } from 'react-router-dom';
import Home from './page/Home';
import Profile from './page/Profile';
import NotFound from './page/NotFound';
import SignIn from './page/SignIn';
import SignUp from './page/SignUp';
import AboutUs from './page/AboutUs';
import TripInformForm from './page/TripInformForm';
import MainLayout from '@/components/layout/MainLayout';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<AboutUs />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Route>

                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="*" element={<NotFound />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route
                        path="/tripinformation"
                        element={<TripInformForm />}
                    />
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
