import {useState, useEffect}  from 'react';


export default function ButtonCreator({rulesChanged}) {
    
    const [buttonText, setButtonText] = useState("");
    const [rules, setRules] = useState([]);

    const [action, setAction] = useState({});
    const [next, setNext] = useState({});

    useEffect(()=>{

        if (buttonText.trim() != ""){
            setRules(buttonText.split(",").map(t=>t.trim()));
        }else{
            setRules([]);
        }
    },[buttonText]);

    const nextChanged = (index=0, n)=>{
        const _next = {...next, [index]:n}
        
        setNext(_next);
        
        rulesChanged(rules.map((r,i)=>{
            return {
                "rule": {
                  "operator": "equals",
                  "operand": r
                },
                "actions": (action[index] || "").split("|").map((line)=>{
                    return line.split(",");
                }),
                "next": _next[i] || ""
              }
        }))
    }

    const actionChanged = (index=0, a)=>{
        const _action = {...action, [index]:a}
        setAction(_action);
        rulesChanged(rules.map((r,i)=>{
            return {
                "rule": {
                  "operator": "equals",
                  "operand": r
                },
                "actions": (_action[index]||"").split("|").map((line)=>{
                    return line.split(",");
                }),
                "next": next[i] || ""
              }
        }))
    }

    const textChanged = (text)=>{
        setButtonText(text);
    }
    const renderRules = ()=>{
        return rules.map((r,i)=>{
            return <div key={r} className="flex flex-row text-sm items-center justify-start mt-4">
                <div className="pr-2 w-64 h-16 items-center justify-start flex">when <strong className="mr-2 ml-2">{r}</strong> is pressed, call</div>
                <div className="flex flex-col justify-center items-start">
                    <input type="text" placeholder="action list" onChange={(e)=>{actionChanged(i, e.target.value)}}></input>
                    <label className="text-xs mt-1 justify-start">format: a1,a2,a3|a5,a6 </label>
                </div>
                <div className="flex ml-2 mr-2  h-16 items-center justify-center"><strong>then move to</strong></div>
                <div className="flex flex-col justify-center items-start">
                    <input className="flex mr-2 items-center justify-center" type="text" placeholder="event" onChange={(e)=>{nextChanged(i, e.target.value)}}></input>
                    <label className="text-xs mt-1 justify-start">another node name</label>
                </div>
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