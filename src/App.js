import logo from './logo.svg';
import './App.css';
import DashBoard from './Pages/Dashboard';
import Navbar from "./UI/Navbar"
import { useState } from 'react';
import ControlPanel from './Pages/ControlPanel';
import {CounterProvider} from './dataContext';
import Logs from './UI/Logs';
function App() {
  const [currentPage,setPage] = useState(<DashBoard></DashBoard>)
  const pageSwitchHandler = (event)=>{
    let page = event.target.innerHTML;
    console.log(page)
    switch(page)
    {
      case 'Dashboard' : setPage(<DashBoard></DashBoard>)
      break;
      case 'Control Panel' : setPage(<ControlPanel></ControlPanel>)
      break;
      case 'Outliers' : setPage(<Logs></Logs>)
      break;
      default : setPage(<DashBoard></DashBoard>)
    }
    
  }
  const off = ()=>{

  }

  return (
    <div className="App">
      <CounterProvider>
       <Navbar
       list = {["Dashboard","Control Panel","Outliers"]}
       first = "XLR8"
       last = "Hub"
       off = {off}
       changePage = {pageSwitchHandler}
       ></Navbar>
      {currentPage}
      </CounterProvider>
    </div>
  );
}

export default App;
