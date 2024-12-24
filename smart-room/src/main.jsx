import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom'; // Thêm import này
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './redux/store';
import { AuthProvider } from './contexts/AuthConText';
import App from './App';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
// Tạo QueryClient instance
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(
 <React.StrictMode>
   <BrowserRouter> {/* Wrap toàn bộ ứng dụng với BrowserRouter */}
     <Provider store={store}>
       <QueryClientProvider client={queryClient}>
         <AuthProvider>
           <App />
         </AuthProvider>
       </QueryClientProvider>
     </Provider>
   </BrowserRouter>
 </React.StrictMode>
);