import { Route, Routes } from 'react-router-dom';
import Home from './page/Home';
import Profile from './page/Profile';
import NotFound from './page/NotFound';
import SignIn from './page/SignIn';
import SignUp from './page/SignUp';
import TripInformForm from './page/TripInformForm';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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
