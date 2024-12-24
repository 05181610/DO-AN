import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthConText';
import { LockClosedIcon , EnvelopeIcon } from '@heroicons/react/20/solid';
import { useLogin } from '../../hooks/useLogin';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { mutate: login, isLoading } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
   <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
     <div className="max-w-md w-full space-y-8">
       <div>
         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
           Đăng nhập
         </h2>
       </div>
       <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
         <div className="rounded-md shadow-sm -space-y-px">
           <div>
             <input
               type="email"
               required
               className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
               placeholder="Email"
               value={formData.email}
               onChange={(e) => setFormData({...formData, email: e.target.value})}
             />
           </div>
           <div>
             <input
               type="password"
               required
               className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
               placeholder="Mật khẩu"
               value={formData.password}
               onChange={(e) => setFormData({...formData, password: e.target.value})}
             />
           </div>
         </div>
          <div>
           <button
             type="submit"
             className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
           >
             Đăng nhập
           </button>
         </div>
          <div className="text-sm text-center">
           <Link to="/register" className="font-medium text-primary hover:text-secondary">
             Chưa có tài khoản? Đăng ký ngay
           </Link>
         </div>
       </form>
     </div>
   </div>
 );
}