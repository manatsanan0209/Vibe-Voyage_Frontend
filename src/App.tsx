import { Route, Routes } from 'react-router-dom';
import Home from './page/Home';
import Profile from './page/Profile';
import NotFound from './page/NotFound';
import SignIn from './page/SignIn';
import SignUp from './page/SignUp';
import AboutUs from './page/AboutUs';
import TripInformForm from './page/TripInformForm';
import CreateRoom from './page/CrateRoom';
import CreateTripPage from './page/CreateTrip';
import MyTrips from './page/MyTrips';
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
                        <Route path="/your-trips" element={<MyTrips />} />
                        <Route
                            path="/create-trip"
                            element={<CreateTripPage />}
                        />
                        <Route path="/createroom" element={<CreateRoom />} />
                        <Route
                            path="/tripinformation"
                            element={<TripInformForm />}
                        />
                    </Route>
                </Route>

                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
