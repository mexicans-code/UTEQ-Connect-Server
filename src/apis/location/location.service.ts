import Destino from './location.model.js';
import fs from 'fs';
import path from 'path';

export const findAllDestinos = async () => {
    try {
        const destinos = await Destino.find();
        return destinos;
    } catch (error) {
        throw new Error('Error obteniendo destinos');
    }
};

export const findDestinoById = async (id: string) => {
    try {
        const destino = await Destino.findById(id);
        return destino;
    } catch (error) {
        throw new Error('Error obteniendo destino');
    }
};

export const createDestino = async (data: { nombre: string; posicion: { latitude: number; longitude: number }; image?: string }) => {
    try {
        const destino = new Destino(data);
        await destino.save();
        return destino;
    } catch (error) {
        throw new Error('Error creando destino');
    }
};

export const updateDestino = async (id: string, data: Partial<{ nombre: string; posicion: { latitude: number; longitude: number }; image?: string }>) => {
    try {
        const destino = await Destino.findByIdAndUpdate(id, data, { new: true });
        return destino;
    } catch (error) {
        throw new Error('Error actualizando destino');
    }
};

export const deleteDestino = async (id: string) => {
    try {
        const destino = await Destino.findById(id);
        
        if (destino?.image) {
            const imagePath = path.join(process.cwd(), destino.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await Destino.findByIdAndDelete(id);
        return destino;
    } catch (error) {
        throw new Error('Error eliminando destino');
    }
};

export const updateDestinoImage = async (id: string, imagePath: string) => {
    try {
        const oldDestino = await Destino.findById(id);
        
        if (oldDestino?.image) {
            const oldImagePath = path.join(process.cwd(), oldDestino.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        
        const destino = await Destino.findByIdAndUpdate(
            id,
            { image: imagePath },
            { new: true }
        );
        return destino;
    } catch (error) {
        throw new Error('Error actualizando imagen del destino');
    }
};

export const deleteDestinoImage = async (id: string) => {
    try {
        const destino = await Destino.findById(id);
        
        if (destino?.image) {
            const imagePath = path.join(process.cwd(), destino.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            
            destino.image = undefined;
            await destino.save();
        }
        
        return destino;
    } catch (error) {
        throw new Error('Error eliminando imagen del destino');
    }
};