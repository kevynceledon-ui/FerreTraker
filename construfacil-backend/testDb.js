import sequelize, { probarConexion } from './db.js';

//al importar los modelos sequelize registra sus relaciones
import { Tienda,Producto,HistorialPrecio } from './models.js';

async function inicializarBaseDeDatos(){
    await probarConexion();

    try{
        //.sync({alter:true}) revisa si las tablas existen sino las crea.
        //si existen pero les faltan columnas las actualiza de forma segura.
        await sequelize.sync({alter: true });
        console.log("Tablas creadas correctamente en supabase");
    }catch(error){
        console.error("Error al crear la base da datos", error.message);
    }

}

inicializarBaseDeDatos();

