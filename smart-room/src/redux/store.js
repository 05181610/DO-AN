import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import roomReducer from './slices/roomSlice';
// Thay đổi cách export
const store = configureStore({
 reducer: {
   auth: authReducer,
   rooms: roomReducer,
 },
 middleware: (getDefaultMiddleware) =>
   getDefaultMiddleware({
     serializableCheck: false,
   }),
});
export default store; // Export default thay vì named export