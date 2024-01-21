import { LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer ,Brush} from "recharts";
import {useState,useReducer,useEffect} from "react"
import { createContext,useContext } from "react";
import axios from "axios";
import React from "react";
import "./Elements.css"
import moment from "moment";
import ToggleButton from "./ToggleButton";
import Input from "./Input";
import RectangularBar from "../UI/RectangularBar"
import Card from "../UI/Card"
import Guage from "../UI/Guage";
import Button from "../UI/Button";
import { useDataContext } from "../dataContext";
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

const BASE_URL = "https://controlhub-881eb-default-rtdb.firebaseio.com/"


const initialData = [];

function formatTimeUnits(value) {
  if (value < 1000) {
    return value + 'ms';
  } else if (value < 60000) {
    return (value / 1000).toFixed(2) + 's';
  } else {
    return (value / 60000).toFixed(2) + 'min';
  }
}

function reduceArrayToFixedSize(originalArray, fixedSize) {
  // Step 1: Group data by time interval (e.g., hourly)

  const groupedData = originalArray.reduce((accumulator, current) => {
    const key = current.current_time;
    /* Calculate the grouping key based on current.current_time */;
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(current);
    return accumulator;
  }, {});

  // Step 2: Calculate the average for each group
  const averagedData = Object.keys(groupedData).map((key) => {
    const group = groupedData[key];
    const totalVoltage = group.reduce((sum, data) => sum + data.voltage, 0);
    const totalCurrent = group.reduce((sum, data) => sum + data.current, 0);
    const totalDutyRaio = group.reduce((sum, data) => sum + data.duty_ratio, 0);

    const averageVoltage = totalVoltage / group.length;
    const averageCurrent = totalCurrent / group.length;
    const avgDuty = totalDutyRaio/group.length;
 
    return {
      current_time: key,
      voltage : averageVoltage,
      current: averageCurrent,
      duty_ratio:avgDuty
    };
  });

  // Step 3: Create a new array with the reduced size (500)
  const step = Math.ceil(averagedData.length / fixedSize);
  const reducedArray = [];
  for (let i = 0; i < averagedData.length; i += step) {
    reducedArray.push(averagedData[i]);
  }

  

  return reducedArray;
 
}








  const initialGraphRanges = [
    { min: 0, max: 600 },
    { min: 0, max: 1000 },
    { min: 0, max: 300 },
    { min: 0, max: 100 },
    { min: 0, max: 100 },
    { min: 0, max: 100 },
    { min: 0, max: 100 },
  ];


let dataFetchInterval = null;
const DashBoard = (props)=>{

    const {dataPoints,dispatch} = useDataContext();
    const [fileteredData,setFilteredData ] = useState([]);
    const [duration,setDuration] = useState(500);
    const [autofresh,setAutoRefresh] = useState(false);
    const [isValid,setValidity] = useState(true);
    const [isValid2,setValidity2] = useState(true)
    const [dateObject,setDateObject] = useState(null);
    const [sampleSize,setSampleSize] = useState(500);
    const initialGraphHeights = [400, 400, 400, 400, 400, 400,400];
    const [graphHeights, setGraphHeights] = useState(initialGraphHeights);
    const [graphRanges, setGraphRanges] = useState(initialGraphRanges);
    const toggleButtonHandler = (event)=>{
      setAutoRefresh(event.target.checked)
    
    }
    
    const durationChangeHandler = (event)=>{
      setValidity(event.target.value>0)
      if(event.target.value>0)
      {
        setDuration(event.target.value)
      }
  }
  const handleZoomChange= (index, value,mod) => {
    const newGraphRanges = [...graphRanges];
    if(mod=='max')
    {newGraphRanges[index] = { ...newGraphRanges[index], max: value };
  }
  else{
    newGraphRanges[index] = { ...newGraphRanges[index], min: value };
  }

    setGraphRanges(newGraphRanges);
  };
  
  const handleDateChange = (event)=>{
    setDateObject(new Date(event.target.value))
  }
  const dataFilter = ()=>{
   
    dispatch({type : 'FILTER',date : dateObject})
  }
  const handleSampleSizeChange = (event)=>{
    setSampleSize(event.target.value)
    setValidity2(event.target.value>=10);
  }
  const handleSliderChange = (index, value) => {
    const newGraphHeights = [...graphHeights];
    newGraphHeights[index] = value;
    setGraphHeights(newGraphHeights);
  };
    const fetchData = async () => {
        let res;
        try {
          
         res = await axios.get(BASE_URL+'readings.json?'+'orderBy="current_time"'+'&limitToLast=200');
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
                  let temp = Object.values(res.data);
                  console.log(res.length)
                    dispatch({type : 'FETCH',data : temp.slice(temp.length-500,temp.length)})
            }
           
        }
        catch(err)
        {
            

        }

        
    }
    useEffect(()=>{
        updateState();
    },[])

    useEffect(()=>{
      if(autofresh)
      {
        setSampleSize(200)
        setDuration(200);
        dataFetchInterval = setInterval(()=>{
          updateState()
        },50)
      }
      else{
        clearInterval(dataFetchInterval)
        setDuration(500);
        setSampleSize(500)
      }
      return ()=>{
        clearInterval(dataFetchInterval)
      }
    },[autofresh])
 
     let startingPoint;
     useEffect(()=>{
      setFilteredData((prev)=>{
        let temp = [];
        // temp = dataPoints.filter(ele=>{
        //   return  new Date(ele.current_time).getTime() <= (new Date(dataPoints[dataPoints.length - 1].current_time).getTime() - duration*1000)
        // })
        temp = dataPoints.slice(dataPoints.length-duration,dataPoints.length);

         if(temp.length>=1)
        { 
         for(let i = 1;i<temp.length;i++)
          { 
           temp[i].current_time = (new Date(temp[i].current_time).getTime())-(new Date(temp[0].current_time).getTime());
          }
          temp[0].current_time = 0;
        }
          if(temp.length>=sampleSize)
        {
          temp = reduceArrayToFixedSize(temp,sampleSize);
        }
        return temp;
        
      }) 
    
     },[dataPoints,duration])
     let chartData;
     if(fileteredData && fileteredData.length>=1)
     {
     chartData = fileteredData.map(ele=>{
        return {
            name : ele.current_time , 
            current:ele.current,
            voltage:ele.voltage,
            amt:ele.voltage
        }
    })
  }
  


    return(
        
        <div className="Dashboard-Page">
          
        <ToggleButton label = "AutoRefresh"
        autofresh = {autofresh}
        onChange = {toggleButtonHandler}
        
        >
        </ToggleButton>
        <Input
         type = "text"
         label = "No of Samples :  (0.2ms each)"
         place = "Title "
         valid = {isValid}
         ind = {0}
         handleChange= {durationChangeHandler}
        
        >
         
       
        </Input>

       
        <Input
         type = "text"
         label = "Maximum Samples Size before Compression"
         place = "Title "
         valid = {isValid2}
         ind = {1}
         handleChange= {handleSampleSizeChange}
        
        >
        </Input>
        <span className="checkbox-label">
            Set Custom Time
        </span>
      
        <input type = "datetime-local" onChange = {handleDateChange}>
        </input>
        <Button
        onClick = {dataFilter}
        >Update Data</Button>
        
        
        <div>
          <h1>Performance Parameters </h1>
        </div>
        <div>
          <h2>Voltage  </h2>
        </div>
        <div>
 
          </div>
          <div className="graph-container">
          <Input 
          label = "Zoom"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphHeights[0]}
          type ='slider'
          handleChange ={(event)=>{
            handleSliderChange(0,parseInt(event.target.value*8))
          }}
          >
          </Input>
          <Input 
          label = "min"
          place = "min"
          valid = {true}
          ind = {0}
          value = {graphRanges[0].min}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(0,parseInt(event.target.value*6),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphRanges[0].max}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(0,parseInt(event.target.value*6),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[0]}>
          
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              name : ele.current_time,
              voltage: ele.voltage
            }
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >  <Brush></Brush>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(tick)=>{
            return formatTimeUnits(tick)
          }} />
          <YAxis unit ="V" domain= {[graphRanges[0].min,graphRanges[0].max]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="voltage" stroke="#FC0388" strokeWidth={1.5
          } activeDot={{ r: 8 }} dot={false} />
        </LineChart>
        </ResponsiveContainer>
        </div>
        <div>
          <h2>Current </h2>
        </div>
        <div className="graph-container">
        <Input 
          label = "Zoom"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphHeights[0]}
          type ='slider'
          handleChange ={(event)=>{
            handleSliderChange(1,parseInt(event.target.value*8))
          }}
          >
          </Input>
          <Input 
          label = "min"
          place = "min"
          valid = {true}
          ind = {0}
          value = {graphRanges[1].min}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(1,parseInt(event.target.value*10),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphRanges[1].max}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(1,parseInt(event.target.value*10),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[1]}>
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              name : ele.current_time,
              current:ele.current
            }
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(tick)=>{
            return formatTimeUnits(tick)
          }} />
          <YAxis unit =  "mA" domain= {[graphRanges[1].min,graphRanges[1].max]}/>
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="current" stroke="#030BFC" 
          strokeWidth={1.5
          }
          activeDot={{ r: 8 } } dot={false}  />
        </LineChart>
        
        </ResponsiveContainer>
        </div>
        <div>
          <h2>Power</h2>
        </div>
        <div className="graph-container">
        <Input 
          label = "Zoom"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphHeights[2]}
          type ='slider'
          handleChange ={(event)=>{
            handleSliderChange(2,parseInt(event.target.value*8))
          }}
          >
          </Input>
          <Input 
          label = "min"
          place = "min"
          valid = {true}
          ind = {0}
          value = {graphRanges[2].min}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(2,parseInt(event.target.value*3),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphRanges[2].max}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(2,parseInt(event.target.value*3),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[2]}>
          
          
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              name : ele.current_time,
              power:ele.current * ele.voltage/1000
            }
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        > 
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(tick)=>{
            return formatTimeUnits(tick)
          }} />
          <YAxis unit =  "W" domain={[graphRanges[2].min,graphRanges[2].max]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="power" stroke="#02bd59"  strokeWidth={1.5
          } activeDot={{ r: 8 }} dot ={false} />
        </LineChart>
       
        </ResponsiveContainer>
        </div>
        <div>
          <h2>Power-Voltage Curve</h2>
        </div>

        <div className="graph-container">
        <Input 
          label = "Zoom"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphHeights[3]}
          type ='slider'
          handleChange ={(event)=>{
            handleSliderChange(3,parseInt(event.target.value*8))
          }}
          >
          </Input>
          <Input 
          label = "min"
          place = "min"
          valid = {true}
          ind = {0}
          value = {graphRanges[3].min}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(3,parseInt(event.target.value*6),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphRanges[3].max}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(3,parseInt(event.target.value*6),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[3]}>
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              voltage : ele.voltage,
              name:(ele.current * ele.voltage/1000).toFixed(2)
            }
          }).sort((a,b)=>{
               return a.name - b.name
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" unit = "W" />
          <YAxis unit =  "V" domain={[graphRanges[3].min,graphRanges[3].max]}/>
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="voltage" stroke="#19d0e6" strokeWidth={1.5
          }  activeDot={{ r: 8 }} dot = {false} />
        </LineChart>
        
        </ResponsiveContainer>
        </div>

        <div>
          <h1>Gating Pulses</h1>

        </div>
        <div>
          <h2>Switch S<sub>1</sub></h2>
        </div>
        <div className="graph-container">
        <Input 
          label = "Zoom"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphHeights[4]}
          type ='slider'
          handleChange ={(event)=>{
            handleSliderChange(4,parseInt(event.target.value)*8)
          }}
          >
          </Input>
          <Input 
          label = "min"
          place = "min"
          valid = {true}
          ind = {0}
          value = {graphRanges[4].min}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(4,parseInt(event.target.value),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphRanges[4].max}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(4,parseInt(event.target.value),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[4]}>
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              name : ele.current_time,
              duty_ratio:(ele.duty_ratio*100).toFixed(2)
            }
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(tick)=>{
            return formatTimeUnits(tick)
          }} />
          <YAxis unit =  "%" domain={[graphRanges[4].min,graphRanges[4].max]}/>
          
          <Legend />
          <Line type="monotone" dataKey="duty_ratio"  strokeWidth={1.5
          } stroke="#02bd59"  activeDot={{ r: 8 }} dot = {false} />
        </LineChart>
        
        </ResponsiveContainer>
        </div>
        <div>
        <h2>Switch S<sub>2</sub></h2>
        </div>
        <div className="graph-container">
        <Input 
          label = "Zoom"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphHeights[5]}
          type ='slider'
          handleChange ={(event)=>{
            handleSliderChange(5,parseInt(event.target.value)*8)
          }}
          >
          </Input>
          <Input 
          label = "min"
          place = "min"
          valid = {true}
          ind = {0}
          value = {graphRanges[5].min}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(5,parseInt(event.target.value),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphRanges[5].max}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(5,parseInt(event.target.value),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[5]}>
          
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              name : ele.current_time,
              duty_ratio:(ele.duty_ratio*100).toFixed(2)
            }
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(tick)=>{
            return formatTimeUnits(tick)
          }} />
          <YAxis unit =  "%" domain={[graphRanges[5].min,graphRanges[5].max]}/>
          
          <Legend />
          <Line type="monotone" dataKey="duty_ratio" strokeWidth={1.5
          } stroke="#FC0388" dot ={false} activeDot = {{r:8}} />
        </LineChart>
        <Brush></Brush>
        </ResponsiveContainer>
        </div>
        <div>
        <h2>Switch S<sub>3</sub></h2>
        </div>
        <div className="graph-container">
        <Input 
          label = "Zoom"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphHeights[6]}
          type ='slider'
          handleChange ={(event)=>{
            handleSliderChange(6,parseInt(event.target.value)*8)
          }}
          >
          </Input>
          <Input 
          label = "min"
          place = "min"
          valid = {true}
          ind = {0}
          value = {graphRanges[6].min}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(6,parseInt(event.target.value),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphRanges[6].max}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(6,parseInt(event.target.value),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[6]}>
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              name : ele.current_time,
              duty_ratio:(ele.duty_ratio*100).toFixed(2)
            }
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(tick)=>{
            return formatTimeUnits(tick)
          }} />
          <YAxis unit =  "%" domain={[graphRanges[6].min,graphRanges[6].max]}/>
          <Tooltip />
          <Legend />
          <Line type="monotone" strokeWidth={1.5
          } dataKey="duty_ratio" stroke="#de7e00" activeDot={{ r: 8 }} dot = {false} />
        </LineChart>
        <Brush></Brush>
        </ResponsiveContainer>
        
        </div>
        </div>
    )

}
export default DashBoard;