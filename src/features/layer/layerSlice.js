import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { dispatch } from 'd3-dispatch';


const _nodesById = {
      "e1" : {
        "name": "e1",
        "id": "e1",
        "onstart": [
            {
                "speech": "hello humbug",
                "duration": 1000
            },
            {
                "speech": "how are you today?",
                "duration": 300
            }
        ],
        "type": "button",
        "subscription": "/press",
        "rules": []
    }
} 

const createLut = (nbi)=>{
    return Object.keys(nbi).reduce((acc, key, index)=>{
        
        const item = nbi[key];

        if (index == 0){
            acc["root"] = {id:item.id, event:item.id}
        }
        return {
            ...acc,
            [item.id] : (item.rules || []).reduce((acc, item, i)=>{
                if (item.next && item.next.trim() != ""){
                    return [...acc, {id:`${item.next}_${index}_${i}`, event: item.next || "", op:item.rule.operand, actions:item.actions} ]
                }
                return acc;
            },[])
        }
    },{});
}
export const layerSlice = createSlice({
  name: 'layer',
  
  initialState: {
    parent: null,
    lut : createLut(_nodesById),
    nodesById :  _nodesById,
    nodes: Object.keys(_nodesById),
    viewAdd: false,
  },

  reducers: {
    //not used?
    addNode : (state, action)=>{
      state.nodes = [...state.nodes, action.payload.id]
      state.nodesById = {
          ...state.nodesById,
          [action.payload.id] : action.payload,
      }
    },
    setParent : (state, action)=>{
        state.parent = action.payload
    },
    setLookup : (state, action)=>{
        state.lut = action.payload
    },
    generateLookuptable : (state)=>{
        state.lut = createLut(state.nodesById)
    },
    setViewAddNode : (state, action)=>{
        state.viewAdd = action.payload;
    },
    updateParent : (state, action)=>{
        state.nodesById = Object.keys(state.nodesById).reduce((acc,key)=>{
            const node = state.nodesById[key];
            if (key !== state.parent){
                return {
                    ...acc,
                    [key] : node
                }
            }else{
                return {
                    ...acc,
                    [key] : {
                        ...node,
                        rules : [...node.rules, {rule: {"operator":"equals", "operand":action.payload.op}, actions:action.payload.actions, next:action.payload.next}]
                    }
                }
            }
        },{})
    }
  }
});



export const { addNode, setParent, updateParent,setLookup,generateLookuptable,setViewAddNode} = layerSlice.actions;

const unique = (value="", arr=[])=>{
  
    let _value = value;
    let i = 0;
    while (arr.indexOf(_value) != -1){
        _value = `${_value}_${++i}`
    }
   
    return _value;
}
export const addNewNode = (node) => {
  return (dispatch, getState) => {
       dispatch(addNode(node));
  }
}

export const setLookuptable = (lut)=>{
    return (dispatch, getState) => {
        dispatch(setLookup(lut));
    }
}

export const setParentToAddTo = (parent)=>{
    return (dispatch, getState) => {
        dispatch(setParent(parent));
      
    }
}

export const showAddNode = (value)=>{
    return (dispatch, getState)=>{
        dispatch(setViewAddNode(value))
    }
}


export const  addToParent = (node, rule, actions)=>{
    return (dispatch, getState)=>{
        const nodes = getState().layer.nodes;
        const name = unique(node.name, nodes);
        const _node = {...node, name:`${name}`, id:`${name.replace(" ","_")}`};
        dispatch(addNewNode(_node));
        dispatch(addRulesToParent(rule,actions,_node.name))
    }
}

export const exportNodes = ()=>{
    return (dispatch, getState)=>{
       
        const lut = getState().layer.lut
        const _lut = Object.keys(lut).reduce((acc,key)=>{
            if (key==="root")
                return acc;
            return {
                ...acc,
                [key] : lut[key]
            }
        },{});

        const nodesById = getState().layer.nodesById;


        const items = Object.keys(_lut).reduce((acc,key)=>{
            return {
                        ...acc,
                        [key] : {
                            ...nodesById[key],
                            rules : _lut[key].map(k=>{
                               return {
                                 "rule": {
                                    "operator": "equals",
                                    "operand": k.op
                                  },
                                  "actions": k.actions,
                                  "next": k.event
                                }
                            })
                        }
                    }
        },{});

       console.log(JSON.stringify(items,null,4));
    }
}
//SOOO close now!
export const addRulesToParent = (op, actions, next)=>{

    return (dispatch, getState)=>{
        dispatch(updateParent({op, actions, next}));
        dispatch(generateLookuptable());
        dispatch(showAddNode(false));
    }
}
export const selectNodes    = state => state.layer.nodesById;
export const selectParent   = state => state.layer.parent;
export const selectViewAdd  = state => state.layer.viewAdd;
export const selectTree     = state => state.layer.lut;

export default layerSlice.reducer;
