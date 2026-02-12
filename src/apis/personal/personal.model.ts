import { Schema, model, Document } from "mongoose";

export interface IPersonal extends Document {
    numeroEmpleado: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
    telefono: string;
    departamento: string;
    cargo: string;
    cubiculo: string;
    planta: string;
    fechaIngreso: Date;
    estatus: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const PersonalSchema = new Schema<IPersonal>(
    {
        numeroEmpleado: {
            type: String,
            required: true
        },
        nombre: {
            type: String,
            required: true
        },
        apellidoPaterno: {
            type: String,
            required: true
        },
        apellidoMaterno: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        telefono: {
            type: String,
            required: true
        },
        departamento: {
            type: String,
            required: true
        },
        cargo: {
            type: String,
            required: true
        },
        cubiculo:{
            type: String,
            required: false
        },
        planta:{
            type: String,
            required: false
        },
        fechaIngreso: {
            type: Date,
            required: true
        },
        estatus: {
            type: String,
            enum: ["activo", "inactivo"],
            default: "activo"
        }
    },
    {
        timestamps: true,
        collection: 'personal'
    }
);

export const PersonalModel = model<IPersonal>("Personal", PersonalSchema, 'personal');
