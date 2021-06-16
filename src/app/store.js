import { configureStore } from '@reduxjs/toolkit';
import creatorReducer from '../features/creator/creatorSlice';
import layerReducer from '../features/layer/layerSlice';

export default configureStore({
  reducer: {
   creator: creatorReducer,
   layer: layerReducer
  },
});
