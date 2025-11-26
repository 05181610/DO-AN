import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import RoomListing from './pages/RoomListing';
import RoomDetail from './pages/RoomDetail';
import PostRoom from './pages/PostRoom';
import MyRooms from './pages/MyRooms';
import EditRoom from './pages/EditRoom';
import PrivateRoute from './components/common/PrivateRoute';
import FavoriteRooms from './pages/FavoriteRooms';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import ReviewSection from './components/review/ReviewSection';
function App() {
 return (
   <Routes>
     <Route element={<Layout />}>
       {/* Public routes */}
       <Route path="/" element={<Home />} />
       <Route path="/login" element={<Login />} />
       <Route path="/register" element={<Register />} />
       <Route path="/rooms" element={<RoomListing />} />
       <Route path="/rooms/:id" element={<RoomDetail />} />
       <Route path="/favorites" element={<FavoriteRooms />} />
       <Route path="/profile" element={<Profile />} />
       <Route path="/profile/edit" element={<ProfileEdit />} />
       <Route path="/dashboard" element={<Dashboard />} />
       <Route path="/post-room" element={<PostRoom />} />
       <Route path="/my-rooms" element={<MyRooms />} />
       <Route path="/edit-room/:id" element={<EditRoom />} />
       <Route path="/reviews/:roomId" element={<ReviewSection />} />
       {/* Protected routes
       <Route element={<PrivateRoute />}>
         <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/post-room" element={<PostRoom />} />
       </Route> */}
     </Route>
   </Routes>
 );
}

export default App;
