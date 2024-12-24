import { createSlice } from '@reduxjs/toolkit';
const initialState = {
 rooms: [],
 loading: false,
 error: null,
 filters: {
   district: '',
   priceRange: '',
   type: '',
   keyword: ''
 }
};
const roomSlice = createSlice({
 name: 'rooms',
 initialState,
 reducers: {
   fetchRoomsStart: (state) => {
     state.loading = true;
     state.error = null;
   },
   fetchRoomsSuccess: (state, action) => {
     state.loading = false;
     state.rooms = action.payload;
     state.error = null;
   },
   fetchRoomsFailure: (state, action) => {
     state.loading = false;
     state.error = action.payload;
   },
   setFilters: (state, action) => {
     state.filters = { ...state.filters, ...action.payload };
   },
   clearFilters: (state) => {
     state.filters = initialState.filters;
   }
 }
});
export const {
 fetchRoomsStart,
 fetchRoomsSuccess,
 fetchRoomsFailure,
 setFilters,
 clearFilters
} = roomSlice.actions;
export default roomSlice.reducer;