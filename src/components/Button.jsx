

const Button=(props)=>{
    
    const {name,className,onClick}=props;
    return(
        <>
            <button className={className} onClick={onClick} >
                 {name}
            </button>
        </>
    )
}

export default Button;