import { chromium} from "playwright";
import fs, { link } from "fs"
import { text } from "stream/consumers";

//imports de los mineros

import { minarSodimac } from "./scrapers/scraperSodimac.js";
import { minarEasy } from "./scrapers/scraperEasy.js";
import { minarImperial } from "./scrapers/scraperImperial.js";

async function iniciarMineria(){
    const busqueda = "cemento 25kg";
    const browser = await chromium.launch({headless: false });


    //por ahora solo sodimac
    const [catalogoSodimac, catalogoEasy,catalogoImperial] = await Promise.all([
        minarSodimac(browser, busqueda),
        minarEasy(browser, busqueda),
        minarImperial(browser, busqueda)
    ]);

    const catalogoTotal = [...catalogoSodimac,  ...catalogoEasy, ...catalogoImperial];

    console.log("\n💰 RESULTADOS DE LA MINERÍA 💰");
    // console.table es una herramienta hermosa de Node para ver Arrays de Objetos
    console.table(catalogoTotal,);

    const catalogoFiltrado = catalogoTotal.filter((producto)=>{

        //pasamos el titulo a minúscula para que sea facil buscar.
        const tituloMin = producto.titulo.toLowerCase();

        //regla 1- tiene que decir cemento si o si
        const tieneCemento = tituloMin.includes("cemento");

        //regla 2 tiene que ser de marca 

        const esMarcaConocida = tituloMin.includes("melón") ||
                                tituloMin.includes("melon") ||
                                tituloMin.includes("bio") ||
                                tituloMin.includes("polpaico")||
                                tituloMin.includes("topex") ||
                                tituloMin.includes("presec");

        //regla 3- prohibido que sea una herramienta o accesorio uso de "!"(no)
       const noEsbasura = !tituloMin.includes("taladro") &&
                          !tituloMin.includes("disco") &&
                          !tituloMin.includes("mancuerna") &&
                          !tituloMin.includes("pesa") &&
                          !tituloMin.includes("macetero") && 
                          !tituloMin.includes("mezclador");
                          
                          
        //si cumple todas las reglas le damos un True para que se quede
        
        return tieneCemento && esMarcaConocida && noEsbasura;
    });

    console.log("\n CATÁLOGO FILTRADO Y LIMPIO ");
    console.table(catalogoFiltrado);


    //exportar a JSON

    try{
        console.log("\n Guardando datos en el disco duro");

        console.log("\n Ordenando productos por precio...");

    // El método sort compara el producto A con el producto B.
    // Si la resta (a - b) da negativo, 'a' se coloca antes que 'b' (orden ascendente).
    catalogoFiltrado.sort((a, b) => {
        return a.precio - b.precio;
    });

        console.log("\n EL MEJOR PRECIO ENCONTRADO:");
    // Imprimimos solo el primer elemento del array (el más barato)
        console.log(`Tienda: ${catalogoFiltrado[0].tienda} | Producto: ${catalogoFiltrado[0].titulo} | Precio: $${catalogoFiltrado[0].precio}`);

        //JSON.stringify convierte la variable a texto en formato JSON
        //El null 2 es un truco para que el archivo quede ordenado
        const DatosEnTextoJSON = JSON.stringify(catalogoFiltrado, null, 2);

        //writeFileSync crea el archivo.le pasamos el nombre y el contenido
        fs.writeFileSync ("cemento_limpio.json", DatosEnTextoJSON)

        console.log("archivo creado con exito!!");
    }catch(error){
        console.log("Error al intentar guardar el archivo", error.message);
    }finally{
        //Cleanup el bloque finally se ejecuta siempre que haya error o no arriba.
        //Es el lugar arquitectonicamente correcto para liberar recursos
        console.log("\n cerrando el navegador y liberando recursos...");
        await browser.close();

        //opcional pero recomendado en scripts de consola
        process.exit(0);
    }
}

iniciarMineria();
