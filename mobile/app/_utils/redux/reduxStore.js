import { configureStore } from '@reduxjs/toolkit';
import reducer from './userSlice';

const store = configureStore({
  reducer: {
    auth: reducer,
  },
});

export default store;