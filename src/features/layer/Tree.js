import {useState, useEffect} from 'react';
import { useDispatch } from 'react-redux';
import * as d3h from 'd3-hierarchy';
import * as d3z from 'd3-zoom';
import { interpolatePath } from 'd3-interpolate-path';
import {useD3} from '../../hooks/useD3.js';



//places to look at used by visme
//handson table
//chartview
//basics panel
//mydatacontent
//lottie annimations!
//amcharts

const SLIDEWIDTH  = 192;
const WHRATIO = 0.5625;
const XPADDING = 18;
const YPADDING = 178;
const sw = SLIDEWIDTH;
const sh = SLIDEWIDTH*WHRATIO;
const TARGETBIGR = 8;
const TARGETSMALLR = 3;
const LINKDELTA = 18;

const ANIMATION_DURATION = 800;

const _flatten = list => list.reduce(
  (a, b) => a.concat(Array.isArray(b) ? _flatten(b) : b), []
);

const _clink = (sx, sy, tx, ty) => {
  return `M ${sx} ${sy} C ${(sx + tx) / 2} ${sy}, ${(sx + tx) / 2} ${ty}, ${tx} ${ty}`;  
}

const insert = (lookup, event, nodes={})=>{
    console.log("inserting...", event.event) 
    const children = lookup[event.event] || [];
    const [name=["x"]] = (nodes[event.event].name || "").split(".");
    const {onstart=""} = nodes[event.event]
    return {event, onstart, name, children : children.map(c => insert(lookup, c, nodes))}
    
}

const convertToHierarchy = (lut,nodes={})=>{
    return insert (lut, lut["root"],nodes);
}

const links = (node={})=>{
 
  if (Object.keys(node).length <= 0){
    return [];
  }
  return  _flatten([
    {    
      from : {
        name:node.data.event.id,
        x: node.x,
        y: node.y + sh 
      },
      to : (node.children||[]).map(c=>({name:c.data.event.id,x:c.x, y:c.y+LINKDELTA, op:c.data.event.op, actions: c.data.event.actions})),
    },
    ...(node.children || []).map(c=>links(c))
  ]);
}

const _expanded = (arr)=>{
  //TODO: ffs the tos can be {} or []!  FIX THIS!
  return arr.reduce((acc,item)=>{
      const {from={}, to=[]} = item;
      const _to = Array.isArray(to) ? to : [to];
      return [...acc,...(_to.map(t=>({from:from, "to":t})))]
  },[]);
}


const lookuplinks = (lnks)=>{
  return lnks.reduce((acc, link)=>{
    return {
              ...acc,
              [`${link.from.name}_${link.to.name}`]: {from: link.from.name, to: link.to.name, op:link.to.op, actions:link.to.actions, x1:link.from.x, y1: link.from.y, x2:link.to.x, y2:link.to.y} 
          }
  },{})
}


export default function Tree({lookuptable,nodes,toggleAddNew,setParentToAddTo,setLookuptable,addNew}) {

    const dispatch = useDispatch();
    console.log("ok have addNEw!! table", addNew);

  //const [lookuptable, setLookuptable] = useState(t);
  
  //isue two lookuptavbles and need to decide when you are using each - updating nodes will pull in new
  //table from props whereas updating positions uodates the current state (in the useeffect).  So if you update the 
  //reduceer with the lookuptable then this is passed back in I think it ought to work..

  const [child, setChild] = useState();
  const [parent, setParent] = useState();

  const reset = ()=>{
      console.log("************************** RESET CLICKED ***********************");
      setChild();
      setParent();
      toggleAddNew(false);
  }

  const childSelected =(e,node)=>{
    console.log("childselected", node);
    toggleAddNew(false);
    setChild(node);
  }

  const parentSelected = (e, node)=>{
   
    if (!child){
       toggleAddNew(true)
    }else{
        toggleAddNew(false)
    }
    setParent(node);
    setParentToAddTo(node.data.event.event);
  }

  useEffect(()=>{
      if (!addNew){
        setParent();
        setChild();
      }
  },[addNew])
  
  useEffect(()=>{ 

    console.log("parent", parent);
    console.log("child", child);

    if (!child){    
       //setParent();
       return;
    }
  

    if (!child || !parent)
      return;

      
    const {event:childevent={}} = child.data || {};
    const {event:parentevent={}} = parent.data || {};
    const lut = {...lookuptable};

    lut[parentevent.event] = lut[parentevent.event] || [];

    const filtered = Object.keys(lut).reduce((acc, key)=>{
        //ignore root!
        if (key === "root"){
          return {
            ...acc,
            [key]:lut[key]
          }
        }

        const children = lut[key] || [];
        
        if (key==parentevent.event){
            return {
              ...acc,
              [key]: [...children, childevent]
            }
        }

        
        if (children.map(c=>c.event).indexOf(childevent.event) !== -1){
          return {
            ...acc,
            [key] : [...children.filter(i=>i.event!==childevent.event)]
          }
        }

        //return unchanged
        return {
          ...acc,
          [key] : children,
        }
    },{});
    setChild();
    setParent();
    console.log("*** setting lookup table!!", filtered);
    dispatch(setLookuptable(filtered));
   
  },[child, parent,lookuptable]);

  const svgref = useD3(
   
    (svg) => {
      const dgbox = svg.select("g#dragbox");
      svg.call(d3z.zoom().on("zoom",  (e)=>{
        dgbox.attr("transform", e.transform)
      }))
    } 
 ,[]);

//LOTS of gotchas here - need to make sure we re-bind the clicks and that we use useEffect to see the changes to state objects AND
//pass in the changed items
const allexcept = (tree, nodestoignore=[])=>{
  const eligible = [];
  tree.each(n=>{
      if (nodestoignore.indexOf(n.data.name)==-1){
         eligible.push(n.data.name);
      }
  })
  return eligible;
}

const treeref = useD3((root) => {
        
    console.log("************** trendering tree!!!!!!!");
    console.log(lookuptable);

    const jsontree = convertToHierarchy(lookuptable,nodes);
    const hier = (d3h.hierarchy(jsontree, d=>d.children));
    const tree   =  d3h.tree().nodeSize([sw+XPADDING,sh+YPADDING])(hier);  
    const _links  = _expanded(links(tree));
    const currentlinks = lookuplinks(_links);
    let eligible = [];

    
    if (child){
      let nodestoignore = child ? [child.parent.data.name] : [];
      child.each(n=> nodestoignore = [...nodestoignore, n.data.name]);
      eligible = allexcept(tree,nodestoignore);
    }

    root.selectAll("g#slide")
        .data(tree.descendants(), (d) => {
            console.log(d.data.event.id);
            return d.data.event.id
        }) //check descendants are changing -- should it not be the name + x,y pos!!????!!!
        .join(
        enter => {

          //render slides!
          const node = enter.append("g")
                            .attr("id", "slide")
                            .attr("transform", (d, i) => `translate(${d.x},${d.y+20})`)
          
          node.append("circle")
              .attr("id", d=>d.data.name)
              .attr("cx", sw/2)
              .attr("cy",sh/2)
              .attr("r", sh/2)
              .style("stroke","black")
              .style("stroke-width", "1.87px")
              .style("fill", "white")

           node.append("text")
                .attr("x", sw/2)
                .attr("y", sh/2+5)
                .style("text-anchor", "middle")
                .text((d)=>d.data.name)

        },
        update => update,
        
        exit => exit.call(exit =>
              exit.remove().transition()
                  .duration(ANIMATION_DURATION)
                  .delay((d, i) => i * 100)
                  .attr("transform", (d,i) => `translate(${i * 50},50)`)
                  .style("opacity", 0)
                  .remove()
            )
        )//update passed through to this..
        .transition()
        .duration(ANIMATION_DURATION)
        .attr("transform", (d, i) => `translate(${d.x},${d.y+20})`);
        
    //render links!
    const link = root.selectAll("path#link").data(_links, d=>`${d.from.name}${d.to.name}`).join(
          enter => {
            enter.append("path").attr("id", "link").attr("d", l=>{
              return _clink(l.from.x+(sw/2), l.from.y+LINKDELTA, l.to.x+(sw/2), l.to.y);
            })
            .style("stroke","#000")
            .style("opacity",0)
            .style("stroke-width", 2.5)
            .style("fill", "none")
            .transition().duration(ANIMATION_DURATION).style("opacity", 1);
          },
          update=>update,
          exit => exit.call(exit=>exit.remove())
      )
      .transition()
      .duration(ANIMATION_DURATION)
      .attrTween("d", l=>{
          const last = treeref.current.last || {};
          const l1 = last[`${l.from.name}_${l.to.name}`];
          var previous = l1 ?  _clink(l1.x1+(sw/2), l1.y1+LINKDELTA, l1.x2+(sw/2), l1.y2) : _clink(l.from.x+(sw/2), l.from.y+LINKDELTA, l.to.x+(sw/2), l.to.y);
          var current =  _clink(l.from.x+(sw/2), l.from.y+LINKDELTA, l.to.x+(sw/2), l.to.y);
          return interpolatePath(previous, current);
      }).on("end", ()=>{
        treeref.current.last = currentlinks; //memoise the previous links
      });
    
     //render circles
     const circle = root.selectAll("g#link").data(_links, d=>{return`${d.from.name}${d.to.name}`}).join(
        enter => {
            const target = enter.append("g").attr("id", "link").attr("transform", l=>`translate(${l.from.x+sw/2 - (l.from.x-l.to.x)/2}, ${l.to.y+ (l.from.y+LINKDELTA-l.to.y)/2})`);

            target.append("circle").attr("id", "link").style("opacity",0).style("fill","white").style("stroke","none").attr("cx", 0).attr("cy",-YPADDING+sh).attr("r",10).transition().duration(ANIMATION_DURATION).style("opacity",1);
            target.append("text").style("text-anchor", "middle").attr("x",0).attr("y",-YPADDING+sh+5).text(l=>l.to.op)
           
            target.append("circle").style("fill","white").style("stroke","none").attr("cx", 0).attr("cy",20).attr("r",20)
            target.append("text").style("text-anchor", "middle").attr("x",0).attr("y",25).text(l=>l.to.actions)
        },
        update=>{
            update.transition().duration(ANIMATION_DURATION).attr("transform", l=>`translate(${l.from.x+sw/2 - (l.from.x-l.to.x)/2}, ${l.to.y+ (l.from.y+LINKDELTA-l.to.y)/2})`);
        },
        exit => exit.call(exit=>exit.remove())
    );

   
    //render targets!
    root.selectAll("g#target")
        .data(tree.descendants(), d => `${d.data.name}${child ? d.data.name==child.data.name ? "_" : "" : ""}`)
        .join(
          enter=>{
            const target = enter.append("g").attr("id", "target").attr("transform", d=>`translate(${d.x-sw/2}, ${d.y})`)
          
            //to target
            target.append("circle").attr("id", "bigtotarget").attr("cx",sw).attr("cy", LINKDELTA+TARGETSMALLR).attr("r", TARGETBIGR).style("fill","#fff").style("stroke","#762bae").attr("stroke-width",2.5).on("click",childSelected)
            target.append("circle").attr("id", "smalltotarget").attr("cx",sw).attr("cy", LINKDELTA+TARGETSMALLR).attr("r", TARGETSMALLR).style("fill","#ae2b4d").style("stroke","#6F67CC").attr("stroke-width",2.5).on("click",childSelected)
           
            //from target
            target.append("circle").attr("id", "bigfromtarget").attr("cx",sw).attr("cy", sh+LINKDELTA).attr("r",  TARGETBIGR).style("fill", d=> parent && parent.data.name == d.data.name ? "#ae2b4d":"white").style("stroke","black").attr("stroke-width",2.5).on("click", parentSelected)
            target.append("circle").attr("id", "smallfromtarget").attr("cx",sw).attr("cy", sh+LINKDELTA).style("opacity", child ? 1 : 0).attr("r",  TARGETSMALLR).style("fill", d=> parent && parent.data.name == d.data.name ? "#ae2b4d":"white").style("stroke","#cc6767").attr("stroke-width",2.5).on("click",parentSelected)
            target.append("text").attr("id", "smalltotarget").attr("x",sw).attr("y",sh+LINKDELTA+5).text("+").style("text-anchor", "middle").style("fill","black").on("click",parentSelected)
 
        },
          update=>{
            
            update.transition().duration(ANIMATION_DURATION).attr("transform", d=>`translate(${d.x-sw/2}, ${d.y})`)

            update.selectAll("circle#bigtotarget").style("fill", (d)=> child && child.data.name == d.data.name ? "red" : "white").style("stroke", (d)=>child && child.data.name == d.data.name ? "white" : "#762bae").on("click", childSelected)
            update.selectAll("circle#smalltotarget").style("fill", (d)=>child && child.data.name == d.data.name ? "red" : "#ae2b4d").style("stroke",(d)=>child && child.data.name == d.data.name ? "white" : "#6F67CC").on("click", childSelected)

            
            update.selectAll("circle#bigfromtarget").style("stroke", child ? "#ae2b4d" : "black").style("fill", d=> parent && parent.data.name == d.data.name ? "#ae2b4d":"white").on("click", parentSelected).transition().duration(ANIMATION_DURATION).attr("r", d=>eligible.indexOf(d.data.name) == -1 ? TARGETBIGR :  TARGETBIGR+4)
            update.selectAll("circle#smallfromtarget").style("opacity", child ? 1 : 0).style("fill",  d=> parent &&  parent.data.name == d.data.name ? "#ae2b4d":"white").on("click", parentSelected).transition().duration(ANIMATION_DURATION).attr("r", d=>eligible.indexOf(d.data.name) == -1 ? TARGETSMALLR : TARGETSMALLR+2).attr("class", d=>eligible.indexOf(d.data.name) == -1 ? "":"pulse");
            update.selectAll("text#smalltotarget").style("opacity", child ? 0 : 1).on("click",parentSelected)
           
          
          },
          exit=> exit.call(exit=>exit.remove())
        )

      
  }, [child, parent]);

 
  //can we do the rendertree, renderlinks and rendertargets in d3 hook?  
  //we can even have two ref objects to deal with the zoom box?
  return (
    <div >
     
      <main>
            <div className="flex justify-center items-center">
            <svg onClick={()=>reset()} ref={svgref} width={"100vw"} height={"100vh"}>
                <g  id="dragbox">
                    <g onClick={(e)=>{e.stopPropagation()}}  ref={treeref}>
                    </g>
                </g>
            </svg>
           
            </div>
      </main>
    </div>
  )
}
