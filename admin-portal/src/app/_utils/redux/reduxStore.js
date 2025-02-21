import { configureStore } from '@reduxjs/toolkit';
import reducer from './orgSlice';

const store = configureStore({
  reducer: {
    auth: reducer,
  },
});

export default store;