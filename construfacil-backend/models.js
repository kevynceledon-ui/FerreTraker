import { DataTypes } from "sequelize";
import sequelize from "./db.js";

//Modelo de tienda

export const Tienda = sequelize.define("tienda",{
    nombre:{
        type:DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {timestamps: false }); //No es necesario saber cuando se creo la tienda

//modelo de producto
export const Producto = sequelize.define("Producto",{
    titulo:{
        type:DataTypes.STRING,
        allowNull:false
    },
    Imagen:{
        type: DataTypes.TEXT
    },
    link:{
        type:DataTypes.TEXT
    }
},{timestamps: true }); //Sequelize creará automaticamente la "createAt" y "updateAt"

//Modelo de historial precio

export const HistorialPrecio = sequelize.define("HistorialPrecio",{
    precio:{
        type:DataTypes.STRING,
        allowNull: false
    }
}, {timestamps: true });

//Relaciones (1 a muchos)

Tienda.hasMany(Producto, {foreignKey: "tienda_id"});
Producto.belongsTo(Tienda, {foreignKey: "tienda_id"});

Producto.hasMany(HistorialPrecio, {foreignKey:"producto_id"});
HistorialPrecio.belongsTo(Producto, {foreignKey: "producto_id"});