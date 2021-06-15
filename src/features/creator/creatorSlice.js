import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const creatorSlice = createSlice({
  name: 'creator',
  
  initialState: {
    nodes: []
  },

  reducers: {
    addNode : (state, action)=>{
      state.nodes = [...state.nodes, action.payload]
    }
  }
});

export const { addNode } = creatorSlice.actions;

export const addNewNode = (r) => (dispatch, getState) => {}
export const selectNodes = state => state.creator.nodes;


export default creatorSlice.reducer;
