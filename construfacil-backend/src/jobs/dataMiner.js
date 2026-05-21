import { chromium} from "playwright";
import fs, { link } from "fs"
import { text } from "stream/consumers";
//Imports tablas 
import { Sequelize } from "sequelize";
import { Tienda,Producto,HistorialPrecio } from "../models/models.js";
//imports de los mineros

import { minarSodimac } from "../scrapers/scraperSodimac.js";
import { minarEasy } from "../scrapers/scraperEasy.js";
import { minarImperial } from "../scrapers/scraperImperial.js";
import sequelize from "../config/db.js";
import { promises } from "dns";

async function iniciarMineria(){
    const categorias = ["madera dimensionada", "melamina", "taladro"];
    const browser = await chromium.launch({headless: false });

//Aquí se guardara e catalogo final combinando todas las categorias
    let catalogoTotal = [];

    //Bucle principal.
    //For ... of respeta el async/await. Esto evita abrir 9 pestañas de golpe

    for(const categoria of categorias){
    console.log(`\n Iniciando minera para  "${categoria.toUpperCase()}"`);
    
    const [catalogoSodimac, catalogoEasy, catalogoImperial] = await Promise.all([
        minarEasy(browser, categoria),
        minarSodimac(browser,categoria),
        minarImperial(browser,categoria)
    ]);

    let resultadosCategoria = [...catalogoEasy, ...catalogoSodimac, ...catalogoImperial];

    //Filtro dinamico
    //Tomamos la primera palabra de categoria, para usarla como regla estricta
    const palabraClave = categoria.split(" ")[0].toLowerCase();

        resultadosCategoria = resultadosCategoria.filter((producto) =>{
            const tituloMin = producto.titulo.toLowerCase();
            
            //Regla 1:  debe contener la palabra clave
            const tienePalabraClave = tituloMin.includes(palabraClave);

            //Regla 2: Filtro universal de basura.
            const noEsbasura = !tituloMin.includes("mancuernas") &&
                               !tituloMin.includes("disco") &&
                               !tituloMin.includes("macetero") &&
                               !tituloMin.includes("pesa")

            //Regla 3 :  el precio debe existir , ser un número valido y mayor a 0
            //Esto evita errores en la base de datos
             const tienePrecioValido = producto.precio !== null &&
                                       producto.precio !== undefined &&
                                       !isNaN(producto.precio) &&
                                       producto.precio > 0;                   
                               
            return tienePalabraClave && noEsbasura && tienePrecioValido;
        });
        
        //Ordenamiento y corte.
        //Orden del más barato al más caro
        resultadosCategoria.sort((a, b) => a.precio - b.precio);

        //.slice 0,15 extrae solo los 15 primeros elementos del array
        //Asi aseguramos tener los mejores precios sin sobrecargar la BD
        const top15 = resultadosCategoria.slice(0,15);

        console.log(`Se obtuvieron los ${top15.length}`);

        catalogoTotal = [...catalogoTotal, ...top15]

        }
    
        //GUARDADO EN BASE DE DATOS 

        try{
            if (catalogoTotal.length > 0){
                console.log("\n Guardando datos en el disco");
                await guardarEnBd(catalogoTotal);

            }else{
                console.log(`\n No se encontraron productos después del filtro`);
            }
        }catch(error){
            console.log("Error general durante la ejecución", error.message);
        }finally {
            console.log("Cerrando el navegador y liberando recursos");
            process.exit(0);
        }

        async function guardarEnBd(catalogoFiltrado) {
    console.log("\n Inicando carga de datos en supabase");

//Sincronizamos por si acaso
await sequelize.sync();

for (const item of catalogoFiltrado){
    try{
        //Buscar o crear la tienda
        const [tiendaRecord] = await Tienda.findOrCreate({
            where: {nombre:item.tienda}
        });

        //buscar o crear el producto
        //usamos el título como identificador único para esa tienda en especifico
        const [productoRecord] = await Producto.findOrCreate({
            where:{
                titulo: item.titulo,
                tienda_id: tiendaRecord.id //FK de la tienda
            },
            defaults:{
                imagen: item.imagen,
                link: item.link
            }
        });

        //Importar siempre le precio de hoy en el historial
        await HistorialPrecio.create({
            precio: item.precio,
            producto_id: productoRecord.id //FK del producto
        });

    }catch(error){
        console.error(`Error al guardar en DB el producto ${item.titulo}:`, error.message);
    }
}
console.log("Carga de datos completado con éxito.");
}
}

iniciarMineria();


    /* const [catalogoSodimac, catalogoEasy,catalogoImperial] = await Promise.all([
        minarSodimac(browser, busqueda),
        minarEasy(browser, busqueda),
        minarImperial(browser, busqueda)
    ]);

    let resultadosCategoria = [...catalogoSodimac,  ...catalogoEasy, ...catalogoImperial];

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
       if (catalogoFiltrado.length > 0){
        console.log("\n EL MEJOR PRECIO ENCONTRADO:");
    // Imprimimos solo el primer elemento del array (el más barato)
        console.log(`Tienda: ${catalogoFiltrado[0].tienda} | Producto: ${catalogoFiltrado[0].titulo} | Precio: $${catalogoFiltrado[0].precio}`);

        await guardarEnBd(catalogoFiltrado);

        } else{
            console.log(`\n No se encontraron productos después del filtro`);
        }

    }catch(error){
        console.log("Error general durante la ejecución", error.message);
    }finally{
        //Cleanup el bloque finally se ejecuta siempre que haya error o no arriba.
        //Es el lugar arquitectonicamente correcto para liberar recursos
        console.log("\n cerrando el navegador y liberando recursos...");
        await browser.close();
        //opcional pero recomendado en scripts de consola
        process.exit(0);
    }
}


async function guardarEnBd(catalogoFiltrado) {
    console.log("\n Inicando carga de datos en supabase");

//Sincronizamos por si acaso
await sequelize.sync({ alter:true});

for (const item of catalogoFiltrado){
    try{
        //Buscar o crear la tienda
        const [tiendaRecord] = await Tienda.findOrCreate({
            where: {nombre:item.tienda}
        });

        //buscar o crear el producto
        //usamos el título como identificador único para esa tienda en especifico
        const [productoRecord] = await Producto.findOrCreate({
            where:{
                titulo: item.titulo,
                tienda_id: tiendaRecord.id //FK de la tienda
            },
            defaults:{
                imagen: item.imagen,
                link: item.link
            }
        });

        //Importar siempre le precio de hoy en el historial
        await HistorialPrecio.create({
            precio: item.precio,
            producto_id: productoRecord.id //FK del producto
        });

    }catch(error){
        console.error(`Error al guardar en DB el producto ${item.titulo}:`, error.message);
    }
}
console.log("Carga de datos completado con éxito.");
}

iniciarMineria();
 */