import { Request, Response } from 'express';
import * as locationService from './location.service.js';

export const getLocations = async (req: Request, res: Response) => {
    try {
        const destinos = await locationService.findAllDestinos();
        res.json({ 
            success: true,
            data: destinos 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido' 
        });
    }
};

export const getLocationById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const destino = await locationService.findDestinoById(id);
        
        if (!destino) {
            return res.status(404).json({
                success: false,
                error: 'Destino no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: destino
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const createLocation = async (req: Request, res: Response) => {
    try {
        const { nombre, posicion } = req.body;
        
        if (!nombre || !posicion || !posicion.latitude || !posicion.longitude) {
            return res.status(400).json({
                success: false,
                error: 'Faltan datos requeridos'
            });
        }
        
        let imagePath: string | undefined = undefined;
        if (req.file) {
            imagePath = `uploads/destinos/${req.file.filename}`;
        }
        
        const destino = await locationService.createDestino({
            nombre,
            posicion,
            image: imagePath
        });
        
        res.status(201).json({
            success: true,
            data: destino
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const updateLocation = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { nombre, posicion } = req.body;
        
        const updateData: any = {};
        if (nombre) updateData.nombre = nombre;
        if (posicion) updateData.posicion = posicion;
        
        if (req.file) {
            updateData.image = `uploads/destinos/${req.file.filename}`;
            
            // Eliminar imagen anterior
            const oldDestino = await locationService.findDestinoById(id);
            if (oldDestino?.image) {
                const fs = await import('fs');
                const path = await import('path');
                const oldImagePath = path.join(process.cwd(), oldDestino.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }
        
        const destino = await locationService.updateDestino(id, updateData);
        
        if (!destino) {
            return res.status(404).json({
                success: false,
                error: 'Destino no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: destino
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const deleteLocation = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const destino = await locationService.deleteDestino(id);
        
        if (!destino) {
            return res.status(404).json({
                success: false,
                error: 'Destino no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Destino eliminado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const getAllAddresses = async (req: Request, res: Response) => {
    try {
        const destinos = await locationService.findAllDestinos();
        const addresses = destinos.map(d => ({
            nombre: d.nombre,
            posicion: d.posicion,
            image: d.image
        }));
        res.json({ 
            success: true,
            data: addresses 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido' 
        });
    }
};

export const uploadLocationImage = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No se ha proporcionado ninguna imagen'
            });
        }
        
        const imagePath = `uploads/destinos/${req.file.filename}`;
        const destino = await locationService.updateDestinoImage(id, imagePath);
        
        if (!destino) {
            return res.status(404).json({
                success: false,
                error: 'Destino no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: destino,
            imageUrl: `${req.protocol}://${req.get('host')}/${imagePath}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const deleteLocationImage = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const destino = await locationService.deleteDestinoImage(id);
        
        if (!destino) {
            return res.status(404).json({
                success: false,
                error: 'Destino no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: destino
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};