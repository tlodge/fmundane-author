import {useState}  from 'react';
import Speech from './Speech';

import { useSelector, useDispatch } from 'react-redux';



import {
   addNewNode,
   selectParent,   
   addRulesToParent,
} from '../layer/layerSlice';

export function Creator() {
    const dispatch = useDispatch();
    const [type, setType]       = useState("button");
    const [name, setName]       = useState("");
    const [rule, setRule]       = useState([]);
    const [speech, setSpeech]   = useState([]);
    const [actions, setActions]   = useState([]);
  
    const parent = useSelector(selectParent);

    const createNode = ()=>{
        
        const node = {
            name: name,
            id: name.replace(/\s/g, "_"),
            onstart: speech,
            type,
            subscription : `/press`,
            rules: [],
        }
        dispatch(addNewNode(node));
        dispatch(addRulesToParent(rule,actions,name))
        //reset();
    }
    
    const speechChanged = (speech = [])=>{
        setSpeech(speech);
    }

    const ruleChanged = (rule = "")=>{
        setRule(rule);
    }

    const nameChanged = (name = "")=>{
        setName(name);
    }

    const actionChanged = (action)=>{
        setActions(action.split("|").map((line)=>{
            return line.split(",");
        }))
    }

    const reset = ()=>{
        setName("");
        setRule("");
        setSpeech([]);
        setType("");
        setActions([]);
    }

    const renderRule = ()=>{
        return <div className="flex flex-col mt-2 items-start">
            <label>rule</label>
            <input type="text" onChange={(e)=>{ruleChanged(e.target.value)}} className="p-1 mt-2"></input>
            <label className="text-xs mt-1">the name of the button that will trigger this event</label>
        </div>
    }

    return<div className="flex flex-col">
        <div className="flex justify-start flex-col">
                <div className="flex flex-col mt-2 items-start">
                    <label>node name</label>
                    <input type="text" onChange={(e)=>{nameChanged(e.target.value)}} className="p-1 mt-2"></input>
                    <label className="text-xs mt-1">a unique name for this node</label>
                </div>
                {parent && renderRule()}
                <div className="flex  flex-col shadow p-2 mt-4">
                    <div className="font-bold text-xs flex justify-start">SPEECH (when this node starts)</div>
                    <div className="flex flex-col mt-2 items-start">
                        <Speech speechChanged={speechChanged}/>
                    </div>
                </div>
                <div className="flex  flex-col shadow p-2 mt-4">
                    <div className="font-bold text-xs flex justify-start">ACTION (what is called when this node is triggered)</div>
                    <div className="flex flex-col mt-2 items-start">
                        <input type="text" placeholder="action list" onChange={(e)=>{actionChanged(e.target.value)}}></input>
                        <label className="text-xs mt-1 justify-start">format: a1,a2,a3|a5,a6 </label>
                    </div>
                </div>
            </div>
        <div><button onClick={createNode} className="p-2 mt-4 bg-blue-500 text-white">Create node!</button></div>
    </div>
}