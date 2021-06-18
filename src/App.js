import './App.css';
import Creator from './features/creator';
import Layer from './features/layer';
import { useSelector } from 'react-redux';

import {
  selectViewAdd
} from './features/layer/layerSlice';

function App() {
  const viewAdd  = useSelector(selectViewAdd);
  return (
    <div className="App w-screen">
       <div className="flex flex-row shadow p-4">
            {viewAdd && <div className="flex flex-grow absolute shadow-xl p-2 bg-white rounded" style={{width:475}}><Creator/></div>}
            <div className="flex flex-grow"><Layer/></div>
       </div>
    </div>
  );
}

export default App;
