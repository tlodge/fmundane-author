import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as d3 from 'd3-hierarchy';

export const layerSlice = createSlice({
  name: 'layer',
  
  initialState: {
    nodes: {
        "id" : "layer1",
      
        "start": {
          "actions": [["fanoff"]],
          "event": "ready?"
        },
      
        "events": [{
          "onstart": ["saygreet"],
          "id": "ready?",
          "name": "ready?",
          "subscription" : "/speech",
          "type": "speech",
          "rules": [{
              "rule": {
                "operator": "contains",
                "operand": ["yes"]
              },
              "actions": [
                ["sayturningonfan","fanhot"]
              ],
              "next": "asknames"
            },
            {
              "rule": {
                "operator": "contains",
                "operand": ["no"]
              },
              "actions": [
                ["sayaskagain"]
              ],
              "next": "ready?"
            }
          ]
        },
        {
          "onstart": ["asknames"],
          "id": "asknames",
          "name": "ask names",
          "subscription" : "/speech",
          "type": "speech",
          "rules": [{
              "rule": {
                "operator": "any"
              },
              "actions": [
                ["sayhello"]
              ],
              "next": "facescan"
            }
          ]
        },
        {
          "onstart": ["askfacescan"],
          "id": "facescan",
          "name": "wizard next",
          "subscription" : "/press",
          "type": "button",
          "data": ["next"],
          "rules": [{
              "rule": {
                "operator": "equals",
                "operand": "next"
              },
              "actions": [
                ["facecameraon"]
              ],
              "next": "wizard2"
            }
          ]
        },
        {
          "onstart": ["saygreat"],
          "id": "wizard2",
          "name": "wizard yes/no",
          "subscription" : "/press",
          "type": "button",
          "data": ["yes","no"],
          "rules": [{
              "rule": {
                "operator": "equals",
                "operand": "yes"
              },
              "actions": [
                ["facecamerascan"],
                ["saygreat"],
                ["sayscanningnow"],
                ["facecameraoff"]
              ],
              "next": "aircheck (gesture)"
            },
            {
              "rule": {
                "operator": "equals",
                "operand": "no"
              },
              "actions": [
                ["saynoworries"],
                ["facecameraoff"]
              ],
              "next": "lights1"
            }
          ]
        },
        {
          "onstart": ["saystarted"],
          "id": "aircheck (gesture)",
          "name": "aircheck (gesture)",
          "subscription" : "/gesture",
          "type": "gesture",
          "rules": [{
              "rule": {
                "operator": "equals",
                "operand": ["thumbsup"]
            } ,
              "actions": [
                ["airmonitoron"]
              ],
              "next": "fin"
            }
          ]
        },
        {
          "onstart": ["saystarted"],
          "id": "lights1",
          "name": "select light colour",
          "subscription" : "/press",
          "type": "button",
          "data": ["red", "blue", "green", "rainbow"],
          "rules": [{
              "rule": {
                "operator": "equals",
                "operand": "red"
              },
              "actions": [
                ["redlights"]
              ],
              "next": "fin"
            },
            {
              "rule": {
                "operator": "equals",
                "operand": "blue"
              },
              "actions": [
                ["bluelights"]
              ],
              "next": "fin"
            },
            {
              "rule": {
                "operator": "equals",
                "operand": "green"
              },
              "actions": [
                ["greenlights"]
              ],
              "next": "fin"
            },
            {
              "rule": {
                "operator": "equals",
                "operand": "rainbow"
              },
              "actions": [
                ["rainbowlights"]
              ],
              "next": "fin"
            }
          ]
        },
        {
          "onstart": ["saystarted"],
          "id": "fin",
          "name": "finished!",
          "subscription" : "/press",
          "type": "button",
          "data": ["done!"],
          "rules": [{
              "rule": {
                "operator": "equals",
                "operand": "done"
              },
              "actions": []
            }
          ]
        }
      ]}
      
  },

  reducers: {
    addNode : (state, action)=>{
      state.nodes = [...state.nodes, action.payload]
    }
  }
});



export const { addNode } = layerSlice.actions;

export const addNewNode = (node) => {
    console.log("seen new node added!!", node);
  return (dispatch, getState) => {
    dispatch(addNode(node));
  }
}

export const selectNodes    = state => state.layer.nodes;
export const selectTree     = state => {

    console.log("ok state layer nodes are", state.layer.nodes);

    const t = tree({...state.layer.nodes, events:format(state.layer.nodes)});
    
    console.log("have tree...!", t.tree);

    return d3.tree().nodeSize([120, 230])(d3.hierarchy(t.tree, d=>d.children));
}

const format = (l)=>{
    return l.events.map((e,i)=>{
        return {
            ...e,
            rules: e.rules.map((r,j)=>{
                return {
                    id: `${e.id}${i}${j}`,
                    ...r,
                }
            })
        }
    })
}

const children = (seen, events, node, trigger, actions=[])=>{
    
    if (!node){
        return;
    }
    if (seen.indexOf(node.id) != -1){
        return {
            id: node.id,
            name: node.name || node.id,
            trigger,
        };
    }
    return {
        id: node.id,
        name: node.name || node.id,
        trigger,
        children: (node.rules || []).map(r=>children([...seen,node.id], events, events[r.next]||"", r.id, actions)).filter(t=>t),
        links : (node.rules || []).reduce((acc, r)=>{
            const key = /*trigger ? `${trigger}` :*/ `${node.id}->${r.next||""}`;
            return {
                ...acc,
                //[`${node.id}->${r.next}`]: {rid: r.id, actions:r.actions, rule:r.rule}
                [r.id]: {rid: r.id, actions:r.actions, rule:r.rule}
            }
        },{})
    }
    
}


const tree = (layer)=>{
    console.log("in tree with layer", layer);

    const events = layer.events.reduce((acc, item)=>{
        return {
            ...acc,
            [item.id] : item, 
        }
    }, {});

    return {
        events,
        tree: children([], events, events[layer.start.event],null,[])
    }
}



export default layerSlice.reducer;
