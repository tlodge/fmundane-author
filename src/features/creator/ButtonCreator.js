import {useState, useEffect}  from 'react';


export default function ButtonCreator() {
    
    const [buttonText, setButtonText] = useState("");
    const [rules, setRules] = useState([]);

    useEffect(()=>{
        if (buttonText.trim() != ""){
            setRules(buttonText.split(",").map(t=>t.trim()));
        }else{
            setRules([]);
        }
    },[buttonText]);

    const textChanged = (text)=>{
        setButtonText(text);
    }
    const renderRules = ()=>{
        return rules.map(r=>{
            return <div key={r} className="flex flex-row text-sm items-center justify-start mt-4">
                <div className="pr-2 w-64 justify-start flex">when <strong className="mr-2 ml-2">{r}</strong> is pressed, call</div>
                <input type="text" placeholder="action list" onChange={(e)=>{}}></input>
                <div className="ml-2 mr-2"><strong>then move to</strong></div>
                <input type="text" placeholder="event" onChange={(e)=>{}}></input>
            </div>
        })
    }

    return  <div>
                <div className="flex flex-col mt-2 items-start">
                    <input type="text" className="p-1 mt-2" onChange={(e)=>textChanged(e.target.value)}></input>
                    <label className="text-xs mt-1">comma separated list of buttons</label>
                </div>
                <div className="flex  flex-col shadow p-2 mt-4">
                    <div className="font-bold text-xs flex justify-start">RULES (what happens when buttons are clicked)</div>
                    {renderRules()}
                </div>
            </div>
}