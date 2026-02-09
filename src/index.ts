import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './database/MongoDB.js';
import locationRoutes from './apis/location/location.routes.js';
import eventRoutes from './apis/event/event.routes.js';
import userRoutes from './apis/user/user.routes.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB
connectDB();

// Routes
app.use('/api/locations', locationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'UTEQ Connect API 🚀' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`API Locations: http://localhost:${PORT}/api/locations`);
    console.log(`API Events: http://localhost:${PORT}/api/events`);
    console.log(`API Users: http://localhost:${PORT}/api/users`);
});

export default app;