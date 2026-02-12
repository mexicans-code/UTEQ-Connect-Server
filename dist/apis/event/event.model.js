import mongoose, { Schema } from "mongoose";
const EventSchema = new Schema({
    titulo: {
        type: String,
        required: [true, "El título es requerido"],
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    fechaInicio: {
        type: Date,
        required: [true, "La fecha de inicio es requerida"]
    },
    fechaFin: {
        type: Date,
        required: [true, "La fecha de fin es requerida"]
    },
    horaInicio: {
        type: String,
        required: [true, "La hora de inicio es requerida"]
    },
    horaFin: {
        type: String,
        required: [true, "La hora de fin es requerida"]
    },
    destino: {
        type: Schema.Types.ObjectId,
        ref: "Destino",
        required: [true, "El destino es requerido"]
    },
    cupos: {
        type: Number,
        required: [true, "Los cupos son requeridos"],
        min: [1, "Debe haber al menos 1 cupo"]
    },
    cuposDisponibles: {
        type: Number,
        required: [true, "Los cupos disponibles son requeridos"],
        min: [0, "Los cupos disponibles no pueden ser negativos"]
    },
    creadoPor: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    activo: {
        type: Boolean,
        default: true
    },
    desactivarEn: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'events'
});
export default mongoose.model("Evento", EventSchema);
