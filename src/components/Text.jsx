

const Text=(props)=>{

   let {as :Tag= 'div' ,className='',text}=props;

    return(
        <>
            <Tag className={className}>
                 {text}
            </Tag>
        </>
    )
}



export default Text;