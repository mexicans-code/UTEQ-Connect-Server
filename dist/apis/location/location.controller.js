import * as locationService from './location.service.js';
export const getLocations = async (req, res) => {
    try {
        const destinos = await locationService.findAllDestinos();
        res.json({
            success: true,
            data: destinos
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
export const getAllAddresses = async (req, res) => {
    try {
        const destinos = await locationService.findAllDestinos();
        const addresses = destinos.map(d => ({
            nombre: d.nombre,
            posicion: d.posicion
        }));
        res.json({
            success: true,
            data: addresses
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
