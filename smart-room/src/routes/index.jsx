import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import Home from '../pages/Home';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import Dashboard from '../pages/Dashboard';
import RoomListing from '../pages/RoomListing';
import RoomDetail from '../pages/RoomDetail';
import PostRoom from '../pages/PostRoom';
import PrivateRoute from '../components/auth/PrivateRoute';
const routes = createBrowserRouter([
 {
   path: '/',
   element: <RootLayout />,
   children: [
     { index: true, element: <Home /> },
     { path: 'login', element: <Login /> },
     { path: 'register', element: <Register /> },
     { path: 'rooms', element: <RoomListing /> },
     { path: 'rooms/:id', element: <RoomDetail /> },
     {
       path: 'dashboard',
       element: <PrivateRoute><Dashboard /></PrivateRoute>
     },
     {
       path: 'post-room',
       element: <PrivateRoute><PostRoom /></PrivateRoute>
     }
   ]
 }
]);
export default routes;