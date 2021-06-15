import './App.css';
import Creator from './features/creator';

function App() {
  return (
    <div className="App w-screen">
       <div className="flex flex-row shadow p-4">
            <div className="flex flex-grow"><Creator/></div>
            <div className="flex flex-grow">Layer</div>
       </div>
    </div>
  );
}

export default App;
