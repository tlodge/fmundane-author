import {useState, useEffect}  from 'react';


export default function Speech() {
    
    const [lines, setLines] = useState([{"speech":"", "duration":0}]);

    const addLine = ()=>{
        setLines([...lines, {"speech":"", "duration":0}])
    }

    const deleteLine = (index)=>{
        return setLines(lines.reduce((acc,item,i)=>{
            return i == index ? acc : [...acc, item];
        },[]));
    }

    const setText = (index,text)=>{
        return setLines(lines.map((acc,item,i)=>{
            return i==index ? {...item, speech:text} : item;
        },[]));
    }

    const setDuration = (index, ms)=>{
        return setLines(lines.map((acc,item,i)=>{
            try{
                return i==index ? {...item, duration:Number(ms)} : item;
            }catch(err){
                return item;
            }
            
        },[]));
    }

    const renderLines = ()=>{
        return lines.map((r,i)=>{
            return <div key={i} className="flex flex-row text-sm items-center justify-start mt-4">
                <div className="flex flex-col justify-start">
                    <input className="mr-4" type="text" value={r.speech} onChange={(e)=>{setText(i,e.target.value)}}></input>
                    <label className="flex justify-start">what to say</label>
                </div>
                <div className="flex flex-col justify-start">
                    <input type="text" value={r.duration} onChange={(e)=>{setDuration(i,e.target.value)}}></input>
                    <label className="flex justify-start">pause (ms) after saying it</label>
                </div>
                <div onClick={()=>deleteLine(i)} className="flex flex-col justify-start pl-2">
                   <div>🗑</div>
                </div>
            </div>
        })
    }

    return  <div>
                
                <div className="flex  flex-col shadow p-2 mt-4">
                    <div onClick={()=>addLine()} className="font-bold text-xs flex justify-start">LINES (+)</div>                    
                    {renderLines()}
                </div>
            </div>
}