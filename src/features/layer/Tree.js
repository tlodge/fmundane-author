import * as React from "react";
import * as d3 from "d3";
import * as d3z from "d3-zoom";
import {useD3} from '../../hooks/useD3';

const _flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? _flatten(b) : b), []
);


const links = (node)=>{
     console.log("getting linsk fro node", node);
    return _flatten([
      {    
        links: node.data.links,
        trigger: node.data.trigger,
        from : {
          name:node.data.id,
          x: node.x,
          y: node.y + 60
        },
        to : (node.children||[]).map(c=>({trigger:c.data.trigger, name:c.data.id,x:c.x, y:c.y-60}))
      },
      ...(node.children || []).map(c=>links(c))
    ])
  }

  const rids = (node)=>{
        const root = Object.keys(node.data.links || {}).reduce((acc, key)=>{
            const item = node.data.links[key];
            return {
                ...acc,
                [item.rid]: item
            }
        },{})
  
        return {
            ...root,
            ...(node.children || []).reduce((acc, item)=>{
                return {
                    ...acc,
                    ...rids(item)
                }
            },{})
        }
  }

const linkdata = (node)=>{
    return {...(node.data.links || {}), ...(node.children || []).reduce((acc,item)=>{
        return {
            ...acc,
            ...linkdata(item),
        }
    },{})}
}

const _clink = (sx, sy, tx, ty) => {
    return <path d={`M ${sx} ${sy} C ${(sx + tx) / 2} ${sy}, ${(sx + tx) / 2} ${ty}, ${tx} ${ty}`} style={{stroke:"#000", strokeWidth:"2", fill:"none"}}></path> 
}

const findNode = (t, name)=>{

    if ((t.data || {}).name == name){
        return t;
    }

    if ((t.children || []).length <= 0){
        return null;
    }
    
    //search children

    let node = null;
    for (let i = 0; i < t.children.length; i++){
        node = findNode(t.children[i], name);
        if (node != null){
            break;
        }
    }
    return node;
}

const moveChart = (gtree, t)=>{
 
    /*const g = d3.select(gtree.current);
    
    if (t.triggered){
        const node = findNode(t, t.id);
        let ty = 0;

        if (node.parent){
            ty = node.x;// - node.parent.x;
        }
        g.transition().duration(2000).attr("transform", `translate(-${node.depth * 250},0`);
    }*/
}

function Tree({t}) {
    
    console.log("ok in tree", t);

    const gtree = React.useRef();
 
    React.useEffect(() => {
        moveChart(gtree, t);
    }, [t]);

    const mytree = useD3((svg) => {
       const dgbox = svg.select("g#dragbox");
       
       svg.call(d3z.zoom().on("zoom",  (e)=>{
            dgbox.attr("transform", e.transform)
        })).call(d3z.zoom, d3z.zoomIdentity.scale(0.8))
    }, []);

    const renderLinks = (links, data)=>{
        return links.map((link)=>{
    
            return link.to.map((l)=>{
                
                //const labeldata = data[`${link.from.name}->${l.name}`] || [];
                const tx = (l.x-link.from.x)/2;
                const ty = (Math.max(l.y,link.from.y)-Math.min(l.y,link.from.y))/2;
                const anchor = "middle";//tx == 0 ? "middle" : tx < 0 ? "end": "start";
                const labeldata = data[l.trigger];
                const mx = 20 + (labeldata.actions.length - 1) * 20;

                const label = labeldata.actions.map((ld,i)=>{
                    return <text key={ld.join(",")} fontSize="x-small" textAnchor={"middle"} x={l.y+60} y={l.x-mx + (i*18)} > {ld.join(',')}</text>
                });

                const {rule={}} = labeldata;
                const operator = rule.operator || "";
                const operand =  rule.operand || [];
                const rulelabel = `${operator}, ${operand}`;

                const ruletext =    <g>
                                        <rect x={link.from.y-20+ty} y={link.from.x-13+tx} width={40} height={12} style={{fill: "#edf2f7"}}/>
                                        <text fontSize="x-small" font-weight="bold" fill="black" textAnchor={anchor} y={link.from.x+tx-5} x={(link.from.y+ty)}>{rulelabel}</text>
                                    </g>


                return <g key={`${l.x},${l.y}`}>
                            {_clink(link.from.y, link.from.x, l.y, l.x)}
                            {ruletext}
                            {label}
                            
                       </g>
            });
           //return link.to.map((l)=><path d={_clink(link.from.x, link.from.y,l.x, l.y)} stroke="#D1D1D1" fill="none"/>);
        });
    }

    const renderTree = (node,selected,rid)=>{
       
        let paint = false;

        if (!rid){
            paint = selected==node.data.id && node.children && node.children.length > 0;
        }else{
            paint = selected===node.data.id && node.data.trigger == rid;
        }

        return <g key={`${node.x},${node.y}`}> 
                   
                    <rect x={node.y-60} y={node.x-10} width={120} height={20} style={{fill: paint ? "#4299e1":"white", stroke:"black"}}/>
                    <text textAnchor="middle" fontSize="x-small"  x={node.y} y={node.x+4}>{node.data.name}</text>
                    {(node.children || []).map(n=>renderTree(n, selected, rid))}
              </g>
    }


    return <div className="text-black bg-gray-200 rounded bg-white overflow-hidden shadow-lg"> 
        <svg ref={mytree} height="400" style={{width:`calc(100vw - 400px)`}}>
            <g ref ={gtree} transform={"translate(50,200)"}>
                <g id="dragbox"> 
                    {renderLinks(links(t), rids(t))}
                    {renderTree(t, t.id, t.triggered)}
                </g>
            </g>   
        </svg>
    </div>
 }
 
 export default Tree;