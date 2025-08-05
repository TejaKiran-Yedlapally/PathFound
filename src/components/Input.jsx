
const Input=(props)=>{
 
    const {className,placeHolder,onChange}=props;
    return(
        <>
           <input className={className} placeholder={placeHolder} onChange={onChange}>
                 
           </input>
        </>
    )
}

export default Input;