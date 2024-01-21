const Guage = (props)=>{
    return(
        <div className={props&& props.type?'gauge  gauge-2':'gauge '}
        style = {{width : "250px" }}
        >
        <div className="percentage"
         style = {{rotate :'' + parseInt((props.value/600) * (180)-180)+'deg' }}></div>
        <div className="mask"></div>
        
        <span className="value">{props.value}{props.unit}</span>
        </div>
    )
}
export default Guage;