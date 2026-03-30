import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './database/MongoDB.js';
import locationRoutes from './apis/location/location.routes.js';
import eventRoutes from './apis/event/event.routes.js';
import userRoutes from './apis/user/user.routes.js';
import invitationRoutes from './apis/eventInvitation/eventInvitation.routes.js';
import personalRoutes from './apis/personal/personal.routes.js';
import authRoutes from "./apis/auth/auth.routes.js";
import espacioRoutes from "./apis/space/Espacio.routes.js";
import { deactivateExpiredEvents } from './apis/event/event.service.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/espacios", espacioRoutes);


// Conectar a MongoDB
connectDB();

// TAREA PROGRAMADA: Desactivar eventos expirados cada minuto
setInterval(async () => {
    try {
        await deactivateExpiredEvents();
    } catch (error) {
        console.error('Error en tarea programada de desactivación:', error);
    }
}, 60000); // Ejecutar cada 60 segundos (1 minuto)

// Routes
app.use('/api/locations', locationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invitaciones', invitationRoutes);
app.use('/api/personal', personalRoutes);
app.use("/api/auth", authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'UTEQ Connect API 🚀' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`⏰ Tarea de desactivación automática de eventos: ACTIVA`);
    console.log(`API Locations: http://localhost:${PORT}/api/locations`);
    console.log(`API Events: http://localhost:${PORT}/api/events`);
    console.log(`API Users: http://localhost:${PORT}/api/users`);
    console.log(`API Invitations: http://localhost:${PORT}/api/invitaciones`);
    console.log(`API Personal: http://localhost:${PORT}/api/personal`);
    console.log(`API Espacios: http://localhost:${PORT}/api/espacios`);
});

export default app;