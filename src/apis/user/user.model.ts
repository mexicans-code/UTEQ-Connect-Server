import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  nombre: string;
  email: string;
  passwordHash: string;
  rol: "superadmin" | "admin" | "user";
  estatus: "activo" | "inactivo";
  fechaCreacion: Date;
  ultimoLogin?: Date;
}

const UserSchema = new Schema<IUser>({
  nombre: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  rol: {
    type: String,
    enum: ["superadmin", "admin", "user"],
    default: "user"
  },
  estatus: {
    type: String,
    enum: ["activo", "inactivo"],
    default: "activo"
  },
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  },
  ultimoLogin: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'users'
});

export default mongoose.model<IUser>("User", UserSchema);