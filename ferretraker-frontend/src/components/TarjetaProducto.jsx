

//El componente recibe "props" , un objeto con los que mandaremos los datosC
function TarjetaProducto (props){

const imagenPlaceHolder =  "https://placehold.co/300x200/ffffff/222222?text=Sin+Imagen";

    //extraemos el producto especifico que viene dentro de las props
    const cemento = props.producto;

    return (
        <div className="tarjeta">
            <div className="tarjet-imagen">
                <img src={imagenPlaceHolder} alt={cemento.titulo} />
            </div>

        <div className="tarjeta-info">
            <span className="badge-tienda">{cemento.tienda}</span>
            <h3>{cemento.titulo}</h3>
            <p className="precio-destacado"> ${cemento.precio.toLocaleString("es-CL")}</p>
        </div>


        </div>
        
        
    );
}

export default TarjetaProducto;