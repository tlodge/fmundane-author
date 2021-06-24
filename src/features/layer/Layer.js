import { useSelector, useDispatch } from 'react-redux';
import Tree from './Tree';

import {
   selectTree,
   selectNodes,
   setLookuptable, 
   setParentToAddTo,
   setViewAddNode,
   selectViewAdd,
   exportNodes,
} from './layerSlice';



export function Layer() {

    const dispatch = useDispatch();
    const nodes = useSelector(selectNodes);
    const lut  = useSelector(selectTree);
    const addNew  = useSelector(selectViewAdd);
    
    const renderTree = ()=>{
        if (lut){
            return <Tree lookuptable={lut} setLookuptable={setLookuptable} nodes={nodes} toggleAddNew={(value)=>dispatch(setViewAddNode(value))} setParentToAddTo={(parent)=>dispatch(setParentToAddTo(parent))} addNew={addNew} exportNodes={exportNodes}/>
        }
    }
    return  <div>
                {renderTree()}
            </div>
}