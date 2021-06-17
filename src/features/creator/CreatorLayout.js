import Speech from "./Speech";



export default function CreatorLayout({nameChanged, speechChanged, ruleChanged}){


    return <div className="flex justify-start flex-col">
                <div className="flex flex-col mt-2 items-start">
                    <label>node name</label>
                    <input type="text" onChange={(e)=>{nameChanged(e.target.value)}} className="p-1 mt-2"></input>
                    <label className="text-xs mt-1">a unique name for this node</label>
                </div>
                <div className="flex flex-col mt-2 items-start">
                    <label>rule</label>
                    <input type="text" onChange={(e)=>{ruleChanged(e.target.value)}} className="p-1 mt-2"></input>
                    <label className="text-xs mt-1">the name of the button that will trigger this event</label>
                </div>
                <div className="flex  flex-col shadow p-2 mt-4">
                    <div className="font-bold text-xs flex justify-start">SPEECH (when this node is triggered)</div>
                    <div className="flex flex-col mt-2 items-start">
                        <Speech speechChanged={speechChanged}/>
                    </div>
                </div>
            </div>

}