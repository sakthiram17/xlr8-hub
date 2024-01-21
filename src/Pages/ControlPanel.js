import { useEffect,useState,useReducer } from "react"
import RectangularBar from "../UI/RectangularBar"
import Card from "../UI/Card"
import Guage from "../UI/Guage"
import { useDataContext } from "../dataContext"
import "./ControlPanel.css"
import ToggleButton from "./ToggleButton"
import Input from "./Input"
import React from "react"
import Button from "../UI/Button"
import axios from "axios"
import LoadingSpinner from "../UI/LoadingSpinner";
import Modal from "../UI/Modal"
const BASE_URL = "https://controlhub-881eb-default-rtdb.firebaseio.com/"
const SERVER = "http://localhost:5000/"
const ControlPanel = ()=>{
const {dataPoints,dispatch} = useDataContext(); 
const [closedLoop,setClosedLoop] = useState(false);
const [modalState,setModalState] = useState(null)
const [spinner,setSpinner ] = useState(null)
const [currentParamters, setCurrentParameters]= useState({


})
const [formData,setFormData] = useState([null,null,0,0,0])
const [isValid,setValidity] = useState([true,true,true,true,true])
let voltage = (dataPoints.length && dataPoints[dataPoints.length-1].voltage);
  let current = (dataPoints.length && dataPoints[dataPoints.length-1].current);
  let power = (voltage*current)/1000;
const onChangeHandler = (event)=>{
  setClosedLoop(event.target.checked);
}
const formChangeHandler = (event)=>{
  let index = event.target.getAttribute('index')
  let temp =[...formData]
  temp[index] = event.target.value;
  let tempV = [...isValid];
  tempV[index] = event.target.value>0?true:false;
  if(index==0)
  {
    let voltage = event.target.value;
    tempV[0] = true;
    if(voltage>=420)
    {
      tempV[0] = false;
    }
    temp[0] = voltage;
  }
  if(index == 1)
  {
    let power = event.target.value;
    tempV[1] = true;
    if(power>=225)
    {
      tempV[1] = false;
    }
    temp[1] = power;
  }
  if(index==2)
  {
    tempV[2] = true;
    let duty = event.target.value;
    if(duty>=60)
    {
      tempV[2] = false;
    }
    temp[2] = duty;
  }
  if(index==3)
  {
    temp[3]= event.target.value;
  }
  
  setFormData(temp)
  setValidity(tempV)


}
const turnOffSpinner = ()=>{
  setTimeout(()=>{
    setSpinner(null);
  },100)
}
const turnOnSpinner = ()=>{
  setSpinner(<LoadingSpinner asOverlay={true}></LoadingSpinner>)
}
const fetchData = async () => {
  let res;
  try {
   res = await axios.get(BASE_URL+'parameters.json?');


  }
  catch(err)
  {
      
  }
  return res;
}
const updateState = async  ()=>{
  let res;
  try{
      res = await fetchData();

      if(res)
          {
             setCurrentParameters(res.data)
      }
     
  }
  catch(err)
  {
      

  }

  
}
useEffect(()=>{
  setInterval(updateState,500)
},[])

return(
        <div className="control-page">
             {spinner}
        
          <Card>
         
            
          {currentParamters && <div className="small-flex-box">
              <h2>Current Parameters</h2>
              <h3>Reference Voltage : {currentParamters.ref_voltage}V</h3>
              <h3>Duty Ratio : {currentParamters.duty_ratio}</h3>
              <h3>Power Limit  :{currentParamters.power_limit}W </h3>
              <h3> K<sub>p</sub> : {currentParamters.kp} </h3>
              <h3>K<sub>i</sub> : {currentParamters.ki} </h3>
            </div>}
          </Card>
        <div className="control-panel">
         
            <ToggleButton label = "Closed Loop"
            onChange = {onChangeHandler}
            autorefresh = {closedLoop}
            >

            </ToggleButton>
          
            <Input 
            type = "number"
            label = "Ref Voltage (V)  "
            place = "Reference Voltage "
            ind = {0}
            handleChange = {formChangeHandler}
            value ={formData[0]}
            valid = {isValid[0]}
            >
            
            </Input>
            
            <Input 
            type = "number"
            label = "Power Limit (W) "
            place = "Reference Voltage "
            value ={formData[1]}
            handleChange = {formChangeHandler}
            ind = {1}
      
            valid = {isValid[1]}
            >
            
            </Input>
            {!closedLoop?<Input 
            type = "number"
            label = "Duty Ratio "
            place = "Duty Cycle "
            ind = {2}
            value ={formData[2]}
            handleChange = {formChangeHandler}
            valid = {isValid[2]}
            >
            
            </Input>:null}

            {closedLoop? 
            <React.Fragment>
              
            <Input type = "number" label = "Proportinal Constant" valid = {true}
            ind= {3}
            value ={formData[3]}
            handleChange = {formChangeHandler}
            ></Input>
            <Input type = "number"
              handleChange = {formChangeHandler} ind = {4} label = "Integral Constant" valid = {true}></Input>
            </React.Fragment> : null
            }
            {modalState}
            <div style = { {display : "flex", justifyContent : "space-evenly"}}>
          <Button 
          onClick = {()=>{
            turnOnSpinner()
            axios.get(SERVER+'soft-stop').then((res)=>{
              turnOffSpinner();
              if(res && res.data)
              {
                if(res.data.message==='done')
                {
                  setModalState(<Modal code = "success" disabled = {false}>
                    Successfully Stopped the Converter
                </Modal>)
                setTimeout(() => {
                  setModalState(null)
              }, 1000);
                  
                }
              }
              else{
                turnOffSpinner()
              setModalState(<Modal code = "error" disabled = {false}>
                    something went wrong!!
                </Modal>)
                setTimeout(() => {
                  setModalState(null)
              }, 1000);

            
              }


            }).catch(ele=>{
              turnOffSpinner()
              setModalState(<Modal code = "error" disabled = {false}>
                    something went wrong!!
                </Modal>)
                setTimeout(() => {
                  setModalState(null)
              }, 1000);

            })
       
          }}
          >Soft Stop</Button>
             <Button 
          onClick = {()=>{
            turnOnSpinner()
            setTimeout(()=>{
              turnOffSpinner();
            },2000)
            
            axios.post(SERVER+'parameters',{
              rev_voltage:formData[0],
              power_limit:formData[1],
              duty_ratio:formData[2],
              kp:formData[3],
              mode:closedLoop?1:0,
              ki:0
            }).then((res)=>{
              
              if(res && res.data)
              {
                if(res.data.message==='done')
                {
                  setModalState(<Modal code = "success" disabled = {false}>
                    Successfully updated Parameters
                </Modal>)
                setTimeout(() => {
                  setModalState(null)
              }, 1000);
                  
                }
              }
              else{
                turnOffSpinner()
              setModalState(<Modal code = "error" disabled = {false}>
                    couldnt update parmeters
                </Modal>)
                setTimeout(() => {
                  setModalState(null)
              }, 1000);

            
              }


            }).catch(ele=>{
              turnOffSpinner()
              setModalState(<Modal code = "error" disabled = {false}>
                    something went wrong!!
                </Modal>)
                setTimeout(() => {
                  setModalState(null)
              }, 1000);

            })
       
          }}
           
            
        
          inverse = {true}
          >Set Parameters</Button>
           <Button 
          onClick = {()=>{
            console.log("ON")
            turnOnSpinner()
            axios.get(SERVER+'soft-start').then((res)=>{
              turnOffSpinner();
              if(res && res.data)
              {
                if(res.data.message==='done')
                {
                  setModalState(<Modal code = "success" disabled = {false}>
                    Starting the Converter
                </Modal>)
                setTimeout(() => {
                  setModalState(null)
              }, 1000);
                  
                }
              }
              else{
                turnOffSpinner()
              setModalState(<Modal code = "error" disabled = {false}>
                    something went wrong!!
                </Modal>)
                setTimeout(() => {
                  setModalState(null)
              }, 1000);

            
              }


            }).catch(ele=>{
              turnOffSpinner()
              setModalState(<Modal code = "error" disabled = {false}>
                    something went wrong!!1
                </Modal>)
                setTimeout(() => {
                  setModalState(null)
              }, 1000);

            })
       
       
          }}
          >Soft Start</Button>

        </div>
        </div>
        <div className="widgets">
        <Card header = "Current"
         title = "Current (0-500) mA"
         parameter = { (current?parseFloat(current).toFixed(2):0) + "mA"}
         danger = {current>=500}
         message = {"Current Exceding maximum Limits"}
        >
        <RectangularBar
        height = "250px"
        width = "80px"
        c1 = "#fca311"
        c2 = "whitesmoke"
        direction = "top"
        level = {(current/1000)  *100}
        text = "Completion"
       
        ></RectangularBar>
        </Card>
        <Card header = " DC Bus Voltage "
        title = "Voltage "
        danger = {voltage >= 420 || voltage <=380}
        message = {"Voltage not within 95-105% of 400V"}
       
        >
       <Guage 
       unit = "V"
       value = {voltage?parseFloat(voltage).toFixed(2):0}
     
       >
       
       </Guage>
        </Card>
        <Card header = " DC Power "
        title = "Power "
        danger = {power>=200}

        message = {"Power Limit exceded"}
        >
       <Guage 
       unit = "W"
       value = {power?power.toFixed(2):null}
       type = {true}
       >
  
       
       </Guage>
        </Card>
        </div>
        </div>
    
      
)
}
export default ControlPanel;