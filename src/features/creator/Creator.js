import {useState}  from 'react';
import ButtonCreator from "./ButtonCreator";
import Layout from "./CreatorLayout";
import { useSelector, useDispatch } from 'react-redux';



import {
   addNewNode,
   selectNodes   
} from '../layer/layerSlice';

const _subscriptiontable = {
    "button" : "press",
}

const lookupsubscripiton = (type)=>{
    return _subscriptiontable[type] || type;
}

export function Creator() {
    const dispatch = useDispatch();
    const [type, setType]       = useState("");
    const [name, setName]       = useState("");
    const [rules, setRules]     = useState([]);
    const [speech, setSpeech]   = useState([]);

    const nodes = useSelector(selectNodes);

    const createNode = ()=>{
        
        const node = {
            name: name,
            id: name.replace(/\s/g, "_"),
            onstart: speech,
            type,
            subscription : `/${lookupsubscripiton(type)}`,
            rules,
        }
        dispatch(addNewNode(node));
        reset();
    }
    
    const speechChanged = (speech = [])=>{
        setSpeech(speech);
    }

    const rulesChanged = (rules = [])=>{
        setRules(rules);
    }

    const nameChanged = (name = "")=>{
        setName(name);
    }

    const reset = ()=>{
        setName("");
        setRules([]);
        setSpeech([]);
        setType("");
    }

    const renderToolbar = ()=>{
        return <div className="flex flex-row">
            <div className="p-4">+</div>
            <div onClick={()=>{setType("speech")}}  className="p-4">speech</div>
            <div onClick={()=>{setType("gesture")}} className="p-4">gesture</div>
            <div onClick={()=>{setType("button")}}  className="p-4">button</div>
        </div>
    }

    const renderAddEvent = ()=>{

        const props = {
            rulesChanged
        }
        switch (type){
            case "speech":
                return <p>speech</p>

            case "gesture":
                return <p>gesture</p>
                
            case "button":
                return <ButtonCreator {...props}/>
        }
    }

    return<div className="flex flex-col">
        <div>{renderToolbar()}</div> 
        <Layout nameChanged={nameChanged} speechChanged={speechChanged}>
            <div className="flex justify-start items-start">{renderAddEvent()}</div> 
        </Layout>
        <div><button onClick={createNode} className="p-2 mt-4 bg-blue-500 text-white">Create node!</button></div>
    </div>
}