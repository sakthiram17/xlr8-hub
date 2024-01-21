import react from "react"

const Log = (props)=>{

return (
  
    <tr class="active-row">
        <td>{props.voltage} V</td>
        <td>{props.current} mA</td>
        <td>{props.voltage * props.current/1000} W</td>
        <td>{props.date}</td>
        <td>{props.time}</td>
    </tr>


    )
    
}

export default Log;