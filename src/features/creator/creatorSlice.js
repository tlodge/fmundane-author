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

export const addNewNode = (node) => {
  console.log("ok in add new node!!");
  return (dispatch, getState) => {
    console.log("adding node", node);
    dispatch(addNode(node));
  }
}

export const selectNodes = state => state.creator.nodes;


export default creatorSlice.reducer;
