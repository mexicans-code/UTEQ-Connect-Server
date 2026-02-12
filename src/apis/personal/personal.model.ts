import mongoose, { Schema, Document } from "mongoose";

export interface IPersonal extends Document {
  usuario: mongoose.Types.ObjectId;
  numeroEmpleado: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  telefono?: string;
  cargo: string;
  cubiculo?: string;
  planta?: string;
  extensionTelefonica?: string;
  edificioId?: mongoose.Types.ObjectId;
  estatus: "dentro" | "fuera";
  fechaIngreso?: Date;
}

const PersonalSchema = new Schema<IPersonal>({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "La referencia al usuario es requerida"],
    unique: true
  },
  numeroEmpleado: {
    type: String,
    required: [true, "El número de empleado es requerido"],
    unique: true,
    trim: true
  },
  nombre: {
    type: String,
    required: [true, "El nombre es requerido"],
    trim: true
  },
  apellidoPaterno: {
    type: String,
    required: [true, "El apellido paterno es requerido"],
    trim: true
  },
  apellidoMaterno: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, "El email es requerido"],
    unique: true,
    trim: true,
    lowercase: true
  },
  telefono: {
    type: String,
    trim: true
  },
  cargo: {
    type: String,
    required: [true, "El cargo es requerido"],
    trim: true
  },
  cubiculo: {
    type: String,
    trim: true
  },
  planta: {
    type: String,
    trim: true
  },
  extensionTelefonica: {
    type: String,
    trim: true
  },
  edificioId: {
    type: Schema.Types.ObjectId,
    ref: "Destino"
  },
  estatus: {
    type: String,
    enum: ["dentro", "fuera"],
    default: "fuera"
  },
  fechaIngreso: {
    type: Date
  }
}, { 
  timestamps: true,
  collection: 'personal'
});

export default mongoose.model<IPersonal>("Personal", PersonalSchema);