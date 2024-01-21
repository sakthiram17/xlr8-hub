import React from "react";
import "./Card.css"
/*
Two types 
Simple add prop type = 'simple' to get it
  returns a normal card with children inside it
Complex (default)
returns card with a link and possibliity add image
  props
  imgsrc,header,text,link,onClick
*/
const Card = (props)=>{

    return(
       
        <div className="Card">
        <div className="CardHeader">
        {props.header}
        </div>
        <div className ='card-content'>
         {props.children}
        <div>
         {props.parameter}
          </div>
        
        </div>
        {props.danger ?<div class="alert danger-alert">
        <h3> {props.message} </h3>
        </div> : null
          }
        
        </div>
     
       
    )

}
export default Card;