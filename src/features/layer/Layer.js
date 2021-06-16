import {useState}  from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Tree from './Tree';

import {
   selectNodes,
   selectTree,  
} from './layerSlice';

export function Layer() {
    const dispatch = useDispatch();
    const nodes = useSelector(selectNodes);
    const tree  = useSelector(selectTree);

    console.log("tree is", tree);
    //const renderNodes = ()=>{
     //   return nodes.map(n=>{
    //        return <div key={n.id}>{JSON.stringify(n)}</div>
    //    })
 //   }

    const renderTree = ()=>{
         console.log("in render tere with", tree);
        if (tree){
            return <Tree t={tree}/>
        }
    }
    return  <div>
                <div> A TREE </div>
                {/*renderNodes()*/}
                {renderTree()}
            </div>
}