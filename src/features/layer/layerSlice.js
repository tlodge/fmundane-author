import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';


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
        "rules": [
            {
                "rule": {
                    "operator": "equals",
                    "operand": "ok"
                },
                "actions": [
                    [
                        "saysad"
                    ],
                    [
                        "eatfood"
                    ]
                ],
                "next": "event1"
            }
        ]
    },
    "event1" : {
        "name": "event1",
        "id": "event1",
        "onstart": [
            {
                "speech": "turning on lights now",
                "duration": 1000
            }
        ],
        "type": "button",
        "subscription": "/press",
        "rules": [
            {
                "rule": {
                    "operator": "equals",
                    "operand": "not ok"
                },
                "actions": [
                    [
                        "saysad"
                    ]
                ],
                "next": "event2"
            },
            {
                "rule": {
                    "operator": "equals",
                    "operand": "no"
                },
                "actions": [
                    [
                        "turnonfan"
                    ]
                ],
                "next": "event3"
            }
        ]
    },
    "event2" : {
            "name": "event2",
            "id": "event2",
            "onstart": [
                {
                    "speech": "we are done for now",
                    "duration": 1000
                }
            ],
            "type": "button",
            "subscription": "/press",
            "rules": [
            {
                "rule": {
                        "operator": "equals",
                        "operand": "nope"
                },
                "actions": [
                    [
                            "finish"
                    ]
                ],
                "next": ""
            }
        ]
    },
    "event3" : {
        "name": "event3",
        "id": "event3",
        "onstart": [
            {
                "speech": "we are done for now",
                "duration": 1000
            }
        ],
        "type": "button",
        "subscription": "/press",
        "rules": [
        {
            "rule": {
                    "operator": "equals",
                    "operand": "ok"
            },
            "actions": [
                [
                        "finish"
                ]
            ],
            "next": ""
        }
    ]
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
    nodes: Object.keys(_nodesById)
  },

  reducers: {
    //not used?
    addNode : (state, action)=>{
      state.nodes = [...state.nodes, action.payload.id]
      state.nodesById = {
          ...state.nodesById,
          [action.payload.id] : action.payload,
      }

      console.log("nodesbyid", state.nodesById);
    },
    setParent : (state, action)=>{
        console.log("ok  -----> setting parent to", action.payload);
        state.parent = action.payload
    },
    setLookup : (state, action)=>{
        state.lut = action.payload
    },
    generateLookuptable : (state)=>{
        state.lut = createLut(state.nodesById)
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



export const { addNode, setParent, updateParent,setLookup,generateLookuptable} = layerSlice.actions;

export const addNewNode = (node) => {
  return (dispatch, getState) => {
      dispatch(addNode(node));
  }
}

export const setLookuptable = (lut)=>{
    console.log("setting lut", lut);
    return (dispatch, getState) => {
        dispatch(setLookup(lut));
    }
}

export const setParentToAddTo = (parent)=>{
    return (dispatch, getState) => {
        dispatch(setParent(parent));
      
    }
}

//SOOO close now!
export const addRulesToParent = (op, actions, next)=>{
    console.log("adding following to parent", op, actions, next);
    return (dispatch, getState)=>{
        dispatch(updateParent({op, actions, next}));
        dispatch(generateLookuptable());
    }
}
export const selectNodes        = state => state.layer.nodesById;
export const selectParent       = state => state.layer.parent;


//EASY FIX NOW.  You currently have two ways that the lookup table is generated.  One is by looking at the nodes and generating it that way (which is done when a new node is created)
//the other way is when it is sent directly from d3.  This should not happen.  The lookuptable should be generated here only, based on the nodes.  It is perfectly reasonable that 
//we modify the state.layer.nodesById and state.layer.nodes and this will then generate the lookup table.  Or we can take the lookup table and modify the nodes as appropriate, which will
//then force selectTree to re-compute.

/*export const selectLookuptable  = state => {
    if (!state.layer.lut){
        return selectTree(state);
    }
    return state.layer.lut;
}*/

export const selectTree     = state => {
    console.log("lut is", state.layer.lut)
    return state.layer.lut

    /*const t = state.layer.nodes.reduce((acc, key, index)=>{
        
        const item = state.layer.nodesById[key];

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
    return t;*/
}

export default layerSlice.reducer;
