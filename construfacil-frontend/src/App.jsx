//Imports de los "hooks" de react. Son herramientas que nos permiten manejar el estado y los ciclos de vida
import { useEffect, useState } from "react";
//Import de axios para poder hacer la peticion hhtp al backend
import axios from "axios";

import "./App.css"

function App(){
  //--ZONA DE ESTADOS-- variables reactivas
  //useState crea varabiles que , cuando cambian, obligan a la pantalla a redibujarse.
  //"productos guarda el array que viene del backend. Empieza como un array vacio []"
  const [productos, setProductos] = useState([]);

  //Cargando es un booleano para mostrar un mensaje mientras esperamos que llegue la data
  const [cargando, setCargando] = useState(true);

  //--ZONA DE EFECTOS--

  //UseEffect sirve para ejecutar código en momentos específicos.
  //Con el array vacio [], le decimos: ejecuta esto solo una vez cuando a página cargue por primera vez
  useEffect(() =>{
    //Declaramos una función asíncrona por que vamos a hacer una petición a internet que toma tiempo
    const obtenerDatos = async () =>{
      try{
        //Pedimos los datos del backend, axios espera a que el servidor de node.js responda
        
        const respuesta = await axios.get(import.meta.env.VITE_API_URL);

        //Cuando llegan los datos ,los metemos en nuestra variable de estado "productos"
        setProductos(respuesta.data);

        //apagamos la pantalla de carga por que los datos ya llegaron 
        setCargando(false);
      }catch(error){
        console.error("Error al conectar con la API", error);
        setCargando(false); //apagamos la carga incluso si hay error, para que no quede girando en infinito
      }
    };
    //se llama a la función para que se ejecute
    obtenerDatos();
  }, []);// este array vacio es vital, si se quita react hara peticiones infinitas al backend y colapsara el pc.

  //--ZONA DE RENDERIZADO-- lo que ve el usuario
  return (
    // Asignamos la clase principal de CSS
    <div className="app-container">
      
      {/* Títulos estáticos */}
      <div className="header">
        <h1>FerreTracker</h1>
        <p>Cotizador de materiales de construcción en tiempo real</p>
      </div>

      {/* RENDERIZADO CONDICIONAL: 
          Si 'cargando' es true, mostramos el mensaje de "Extrayendo...".
          Si es false (los datos llegaron), ejecutamos lo que está después de los dos puntos (:) */}
      {cargando ? (
        <p className="loading-text">Extrayendo los mejores precios de la base de datos...</p>
      ) : (
        <div className="productos-grid">
          
          {/* MAP: La función .map() de JavaScript recorre nuestro array de 'productos' uno por uno.
              Por cada producto que encuentra en la BD, "imprime" este bloque de código (la tarjeta). */}
          {productos.map((producto) => (
            
            /* KEY: Cada vez que usamos un map en React, el elemento padre necesita un 'key' único. 
               Esto le ayuda a React a saber qué elemento borrar o actualizar si cambian los datos sin redibujar todo. */
            <div key={producto.id} className="producto-card">
              
              {/* COMPROBACIÓN: ¿El producto tiene una imagen? Si la tiene (&&), dibujamos esta caja */}
              {producto.imagen && (
                <div className="imagen-container">
                  <img src={producto.imagen} 
                  //Si en el navegador no puede cargar la URl 404,enlace roto etc.React dispara automaticamente este evento
                  onError={(e) =>{
                    //"e.target" hace referencia a esta misma etiqueta 
                    //Le cambiamos el "src" en tiempo real por una imagen de remplazo generica
                    //Alojada en un servicio de placeholder
                    e.target.src = "https://placehold.co/400x400/2A2A2A/FFD700?text=Imagen\\nNo+Disponible";
                    //esto es opcional evitamos que  si la imagen de remplazo falla se cree un bucle infinito 
                    e.target.onError = null
                  }}
                  alt={producto.titulo} className="imagen-producto" />
                </div>
              )}

              {/* Inyectamos variables de JS dentro del HTML usando llaves {} */}
              <h3 className="producto-titulo">{producto.titulo}</h3>
              
              <p className="producto-tienda">
                {/* El símbolo '?' (Optional Chaining) evita que la app explote si, por algún error de red, 
                    la tienda no llega desde el backend. Si es nula, simplemente no imprime el nombre. */}
                Tienda: <strong>{producto.tienda?.nombre}</strong>
              </p>

              {/* COMPROBACIÓN ANIDADA: Solo mostramos la caja de precio si existe el array de HistorialPrecios 
                  y además tiene al menos 1 precio registrado (> 0) */}
              {producto.HistorialPrecios && producto.HistorialPrecios.length > 0 && (
                <div className="precio-box">
                  <p className="precio-label">Mejor Precio Actual</p>
                  <p className="precio-valor">
                    {/* toLocaleString('es-CL') es magia nativa de JS. Toma el número 3490 y lo convierte a "3.490" formato chileno.
                        Accedemos a [0] porque en el backend le dijimos que nos ordene los precios del más nuevo al más viejo. */}
                    ${producto.HistorialPrecios[0].precio.toLocaleString('es-CL')}
                  </p>
                    {/* NUEVA LÍNEA: 21.5 */}  
                  <p className="precio-fecha">
                      actualizados:{
                        //Tomamos el string feo de la base de datos y se mete dentro de un new date para convertirlo en un objeto de tiempo real  de js
                        //Usamos tolocaldatestring  para formatearlo.
                        new Date(producto.HistorialPrecios[0].createdAt).toLocaleDateString( "es-CL",{
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })
                      }
                  </p>
                </div>
              )}

              {/* Enlace dinámico que lleva al usuario directo a la página de compra en Easy/Sodimac.
                  target="_blank" abre una pestaña nueva. rel="noopener noreferrer" es obligatorio por seguridad anti-hackeo de pestañas. */}
              <a href={producto.link} target="_blank" rel="noopener noreferrer" className="btn-comprar">
                Ver en la Tienda
              </a>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default App;