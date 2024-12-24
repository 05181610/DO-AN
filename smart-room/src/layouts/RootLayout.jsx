import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
export default function RootLayout() {
 return (
   <div className="flex flex-col min-h-screen">
     <Header />
     <main className="flex-grow">
       <Outlet />
     </main>
     <Footer />
   </div>
 );
}