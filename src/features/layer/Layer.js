import { useSelector, useDispatch } from 'react-redux';
import Tree from './Tree';

import {
   selectTree,
   selectNodes,
   setLookuptable, 
   setParentToAddTo,
} from './layerSlice';



export function Layer({toggleAddNew}) {

    const dispatch = useDispatch();
    const nodes = useSelector(selectNodes);
    const lut  = useSelector(selectTree);

    
    const renderTree = ()=>{
        if (lut){
            return <Tree lookuptable={lut} setLookuptable={setLookuptable} nodes={nodes} toggleAddNew={toggleAddNew} setParentToAddTo={(parent)=>dispatch(setParentToAddTo(parent))}/>
        }
    }
    return  <div>
                {renderTree()}
            </div>
}