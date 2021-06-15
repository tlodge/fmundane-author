import {useState}  from 'react';
import ButtonCreator from "./ButtonCreator";
import Layout from "./CreatorLayout";

import {
   addNewNode,
   selectNodes   
} from './creatorSlice';

export function Creator() {

    const [type, setType] = useState();

    const renderToolbar = ()=>{
        return <div className="flex flex-row">
            <div className="p-4">+</div>
            <div onClick={()=>{setType("speech")}}  className="p-4">speech</div>
            <div onClick={()=>{setType("gesture")}} className="p-4">gesture</div>
            <div onClick={()=>{setType("button")}}  className="p-4">button</div>
        </div>
    }

    const renderAddEvent = ()=>{
        switch (type){
            case "speech":
                return <p>speech</p>

            case "gesture":
                return <p>gesture</p>
                
            case "button":
                return <ButtonCreator/>
        }
    }

    return<div className="flex flex-col">
        <div>{renderToolbar()}</div> 
        <Layout>
            <div className="flex justify-start items-start">{renderAddEvent()}</div> 
        </Layout>
    </div>
}