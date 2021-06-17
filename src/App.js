import './App.css';
import Creator from './features/creator';
import Layer from './features/layer';
import {useState} from 'react';

function App() {
  
  const [addNew, setAddNew]= useState(false);

  const toggleAddNew = (value=false)=>{
    console.log("restteiing addNew", value);
    setAddNew(value);
  }
  return (
    <div className="App w-screen">
       <div className="flex flex-row shadow p-4">
            {addNew && <div className="flex flex-grow absolute shadow-xl p-2 bg-white rounded" style={{width:475}}><Creator/></div>}
            <div className="flex flex-grow"><Layer toggleAddNew={toggleAddNew}/></div>
       </div>
    </div>
  );
}

export default App;
