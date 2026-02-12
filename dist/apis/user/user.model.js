import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
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
export default mongoose.model("User", UserSchema);
