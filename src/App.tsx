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
import Settings from './page/Settings';
import TripSuggestions from './page/TripSuggestions';
import TripSuggestionDetail from './page/TripSuggestionDetail';
import MainLayout from '@/components/layout/MainLayout';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import JoinTripLifestyle from '@/page/JoinTripLifestyle';

export function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/trips" element={<TripSuggestions />} />
                        <Route
                            path="/trips/:id"
                            element={<TripSuggestionDetail />}
                        />

                        <Route element={<ProtectedRoute />}>
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/your-trips" element={<MyTrips />} />
                            <Route
                                path="/create-trip"
                                element={<CreateTripPage />}
                            />
                            <Route
                                path="/your-trips/:id"
                                element={<CreateRoom />}
                            />
                            <Route
                                path="/your-trips/:id/lifestyle"
                                element={<JoinTripLifestyle />}
                            />
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
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;
