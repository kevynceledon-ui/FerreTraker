import datosCementos from "./data/cemento_limpio.json"

//import tarjeta de productos, llamaremos a esto una de las piezas de lego necesaria para su funcionamiento
import TarjetaProducto from "./components/TarjetaProducto";

import "./App.css";

function App() {
  return (
    <div className="container">
      <h1>construFacil</h1>
      <p>Se cargaron {datosCementos.length} productos listo para comprar.</p>

      <div className="grilla-producto">
    {datosCementos.map((cemento, index) =>{

      return (
        //Por cada cemento en el JSON  llamamos a la pieza tarjeta producto.
        //le pasamos el objeto entero usando la prop producto={cemento}
        //react siempre exige una prop "key" unica cuando imprimes listas
        <TarjetaProducto key={index} producto={cemento} />
      );
    })}

      </div>

    </div>
  );

  
}

export default App;