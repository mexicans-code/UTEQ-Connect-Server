import Destino from './location.model.js';
export const findAllDestinos = async () => {
    try {
        const destinos = await Destino.find();
        return destinos;
    }
    catch (error) {
        throw new Error('Error obteniendo destinos');
    }
};
