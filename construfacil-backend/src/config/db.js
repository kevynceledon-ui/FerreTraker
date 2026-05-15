import { Sequelize } from "sequelize"
import "dotenv/config"; //Carga automaticamente las variables del archivo env

//verificación que la variable de entorno exista antes de intentar conectar
if(!process.env.DIRECT_URL) {
    console.error("FALTA DIRECT_URL: No se encontro la variable de entorno.")
    process.exit(1);
}

//inicio de sequelize
const sequelize = new Sequelize(process.env.DIRECT_URL, {
    dialect:"postgres",
    dialectOptions: {
        ssl:{
            require:true,
            rejectUnauthorized: false //Muy necesario para conectar supabase desde fuera
        },
        logging: false  //apagado por ahora para no llenar de querys la consola
    }
});

//función para testear la conexión
export async function probarConexion(){
    try{
        await sequelize.authenticate();
        console.log("Conexión a la base de datos establecida con éxito");

    }catch(error){
        console.error("Error al conectar a la base de datos", error.message);
    }
}

export default sequelize