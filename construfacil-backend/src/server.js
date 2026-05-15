import express from "express";
import cors from "cors";

//rutas
import { Producto,Tienda,HistorialPrecio } from "./models/models.js";

const app = express(); 

//middleware
app.use(cors());//Permite que el front end consuma esta API
app.use(express.json()); //Habilita la lectura de JSON

//Endpoints: Catálogo compoleto con historial

app.get("/api/productos", async(req, res) =>{
    try{
        const productos = await Producto.findAll({
            include:[
                {
                    model: Tienda,
                    attributes: ["nombre"]
                },
                {
                    model:HistorialPrecio,
                    attributes: ["precio", "createdAt"]
                }
            ],
            order: [
                [HistorialPrecio, "createdAt", "DESC"]
            ]
        });

        res.json(productos);

    }catch(error){
        console.error("Error en la API:", error);
        res.status(500).json({ error: "Error interno del servidor"});
    }
});

const PORT = process.env.PORT || 3000;
app.listen (PORT, () =>{
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
})