import Espacio, { IEspacio } from "./Espacio.model.js";

export const findAllEspacios = async () => {
    return Espacio.find().populate("destino", "nombre posicion");
};

export const findEspacioById = async (id: string) => {
    return Espacio.findById(id).populate("destino", "nombre posicion");
};

export const findEspaciosByDestino = async (destinoId: string) => {
    return Espacio.find({ destino: destinoId }).populate("destino", "nombre posicion");
};

export const findEspaciosDisponiblesByDestino = async (destinoId: string) => {
    return Espacio.find({ destino: destinoId, ocupado: false }).populate("destino", "nombre posicion");
};

export const createEspacio = async (data: Partial<IEspacio>) => {
    const espacio = new Espacio(data);
    return espacio.save();
};

export const updateEspacio = async (id: string, data: Partial<IEspacio>) => {
    return Espacio.findByIdAndUpdate(id, data, { returnDocument: "after", new: true });
};

export const deleteEspacio = async (id: string) => {
    return Espacio.findByIdAndDelete(id);
};

export const setOcupado = async (id: string, ocupado: boolean) => {
    return Espacio.findByIdAndUpdate(id, { ocupado }, { returnDocument: "after", new: true });
};