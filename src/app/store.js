import { configureStore } from '@reduxjs/toolkit';
import creatorReducer from '../features/creator/creatorSlice';

export default configureStore({
  reducer: {
   creator: creatorReducer
  },
});
