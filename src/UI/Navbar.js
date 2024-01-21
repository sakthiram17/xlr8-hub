import React from 'react'
import { useEffect,useState } from 'react';

import './Navbar.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useContext } from 'react';


/*
Guide to Use this Navbar
props 
 off function - required to disable this navbar when switching to
  small devices
 first - name in font type one
 last - name in font type two
 list - list of pages
 changePage - function to handle base switching in app.js or parent
 file
 

*/
const Navbar = (props)=>{
    const [width,getWidth] = useState(window.innerWidth)



    let navElementList = props.list;
    let header = props.header;
    let navList = [];
    let menuButton = null;
  
        for(var i = 0;i<props.list.length;i++)
        {   if(props.list[i]==props.active)
            {
                navList.push(<li onClick = {props.changePage }key = {i} className='NavbarElement Active'>{props.list[i]}</li>)
            }
            else{
                navList.push(<li onClick = {props.changePage }key = {i} className='NavbarElement'>{props.list[i]}</li>)
        }
    
    
 

  
              
        }
  

    const nav = (
        <div className='NavBar'>
        <div className= 'btn-grp'>
        {menuButton}
        </div>
        <div className = {'navbar-header'}
        >
           
        <span className="header-f">{props.first}</span>
        <span className = "header-l">{props.last}</span>
        </div>
        <ul type = "none">
        {navList}
     
       
        </ul>
        </div>
    );
    return nav;


}
export default Navbar