const ToggleButton = (props)=>{
    return(
        <div className="checkbox-wrapper-22">
        <span className="checkbox-label">
            {props.label}
        </span>
        <label className ="switch">
        <input type="checkbox" className="checkbox" onChange={props.onChange} value = {props.autorefresh}/>
        <span className ="slider round"></span>
        </label>
        </div>
    )
}
export default ToggleButton;