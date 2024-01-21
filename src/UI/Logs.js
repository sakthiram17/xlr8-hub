import { useEffect,useState } from "react"
import { useDataContext } from "../dataContext"
import Log from "./Log";
import "./Logs.css"
import * as XLSX from "xlsx"
import Button from "./Button";

import ToggleButton from "../Pages/ToggleButton";
const Logs = ()=>{
    const {dataPoints,dispatch} = useDataContext();
    const [json,setJson] = useState(true);
    const switchHandler = (event) =>
    {
        setJson(event.target.checked)
    }
    let logs = dataPoints.filter(ele=>{
        let outlier = false;
        if (ele.voltage>420 || ele.voltage<380)
        {
            outlier = true;
        }
        if(ele.current>=600)
        {
            outlier = true;
        }
        if(ele.current*ele.voltage/1000  >=220)
        {
            outlier = true;
        }
        return outlier == true;
    }).slice(0,40);
    const s2ab = (s) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
      };

      
    const handleExportToJson = (all) => {
        let data;
        if(all==true)
        {
            data = dataPoints;
        }
        else{
            data = logs;
        }
        let blob;
        if(json)
        {
        const jsonData = JSON.stringify(data, null, 2);
         blob = new Blob([jsonData], { type: 'application/json' });
        
        }
        else{
             const aoa = data.map(obj => Object.values(obj));

    // Create a worksheet
                 const wb = XLSX.utils.book_new();
                 const ws = XLSX.utils.json_to_sheet(data)
                 XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');  
                
          
            // Corrected usage of XLSX.write
            const wbout = XLSX.write(wb, { bookType:'xlsx',type : 'array ',mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
             blob = new Blob((wbout), { type: 'application/octet-stream' });
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output_data.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
      



        return(
            <div className = "logs">
            <table class="styled-table">
               <thead>
                <tr>
                    <th>Voltage</th>
                    <th>Current</th>
                    <th>Power</th>
                    <th>Date</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
            {logs.map((ele)=>{
                const dateObj = new Date(ele.current_time);
                const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
                const formattedTime = `${dateObj.getHours()} : ${dateObj.getMinutes()} : ${dateObj.getSeconds()}`;
              return (
              <Log
              voltage = {ele.voltage?(ele.voltage/100)*100:0}
              current = {ele.current*100/100}
              power = {parseFloat(ele.voltage*ele.current/100).toFixed(2)}
              duty_ratio = {ele.duty_ratio}
              date = {formattedDate}

              time = {formattedTime}

              key = {Math.random().toString(36).substring(2,7)}
              >
      
              </Log>)
            })}
            </tbody>
            </table>
            <div  style = { {display : "flex", justifyContent : "space-evenly"}}>
            <ToggleButton
            label = {json?"json":"xlsx"}
            autorefresh = {json}
            onChange = {switchHandler}
            >

            </ToggleButton>
            <Button onClick = {()=>{
                handleExportToJson(false)
            }}>Export Outliers</Button>
            <Button inverse= {true} onClick = {()=>{
                handleExportToJson(false)
            }}>Export All data Points</Button>
            </div>
            </div>
    
            
          
    )


}
export default Logs;
