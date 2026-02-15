import { Schema, model, Document } from "mongoose";
import bcrypt from 'bcryptjs';

export interface IPersonal extends Document {
  numeroEmpleado: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  password: string;
  imagenPerfil?: string;
  telefono: string;
  departamento: string;
  cargo: string;
  cubiculo: string;
  planta: string;
  fechaIngreso: Date;
  estatus: string;
  rol: 'admin' | 'superadmin';
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const PersonalSchema = new Schema<IPersonal>(
  {
    numeroEmpleado: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    apellidoPaterno: { type: String, required: true },
    apellidoMaterno: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { type: String, required: true, select: false },
    imagenPerfil: {
      type: String,
      required: false,
      default: null
    },
    telefono: { type: String, required: true },
    departamento: { type: String, required: true },
    cargo: { type: String, required: true },
    cubiculo: { type: String, required: false },
    planta: { type: String, required: false },
    fechaIngreso: { type: Date, required: true },
    estatus: { 
      type: String, 
      enum: ["activo", "inactivo"], 
      default: "activo" 
    },
    rol: { 
      type: String, 
      enum: ['admin', 'superadmin'],
      default: 'admin'
    }
  },
  { 
    timestamps: true, 
    collection: 'personal' 
  }
);

// Hash password antes de guardar
PersonalSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar passwords
PersonalSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export const PersonalModel = model<IPersonal>("Personal", PersonalSchema, 'personal');