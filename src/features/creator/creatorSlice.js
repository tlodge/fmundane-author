import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const creatorSlice = createSlice({
  name: 'creator',
  
  initialState: {
    nodes: [],
    parent: null,
  },

  reducers: {
    addNode : (state, action)=>{
      state.nodes = [...state.nodes, action.payload]
    },
   
  }
});

export const { addNode,setParent } = creatorSlice.actions;

export const addNewNode = (node) => {

  return (dispatch, getState) => {
    dispatch(addNode(node));
    const parenttoaddto = getState().creator.parent;

    //dispatch(setParentToAddTo(null))
  }
}


export const selectNodes = state => state.creator.nodes;
export const selectParent = state=>state.creator.parent;

export default creatorSlice.reducer;
