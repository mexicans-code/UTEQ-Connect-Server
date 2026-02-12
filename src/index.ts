import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './database/MongoDB.js';
import locationRoutes from './apis/location/location.routes.js';
import eventRoutes from './apis/event/event.routes.js';
import userRoutes from './apis/user/user.routes.js';
import personalRoutes from './apis/personal/personal.routes.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || '*'
        : '*',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB
connectDB();

// Routes
app.use('/api/locations', locationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/personal', personalRoutes);

// Ruta raíz
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'UTEQ Connect API',
        version: '1.0.0',
        status: 'OK',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            locations: '/api/locations',
            events: '/api/events',
            users: '/api/users',
            personal: '/api/personal',
            health: '/health'
        }
    });
});

// 404 Handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path
    });
});

// Error Handler Global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Iniciar servidor
const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log('UTEQ Connect API Server');
            console.log(`Servidor: http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('');
            console.log('Endpoints disponibles:');
            console.log(`Locations: http://localhost:${PORT}/api/locations`);
            console.log(`Events:    http://localhost:${PORT}/api/events`);
            console.log(`Users:     http://localhost:${PORT}/api/users`);
            console.log(`Personal:  http://localhost:${PORT}/api/personal`);
            console.log(`Health:    http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Error al iniciar servidor:', error);
        process.exit(1);
    }
};

startServer();

export default app;
