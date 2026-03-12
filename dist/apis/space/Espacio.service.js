import Espacio from "./Espacio.model.js";
export const findAllEspacios = async () => {
    return Espacio.find().populate("destino", "nombre posicion");
};
export const findEspacioById = async (id) => {
    return Espacio.findById(id).populate("destino", "nombre posicion");
};
export const findEspaciosByDestino = async (destinoId) => {
    return Espacio.find({ destino: destinoId }).populate("destino", "nombre posicion");
};
export const findEspaciosDisponiblesByDestino = async (destinoId) => {
    return Espacio.find({ destino: destinoId, ocupado: false }).populate("destino", "nombre posicion");
};
export const createEspacio = async (data) => {
    const espacio = new Espacio(data);
    return espacio.save();
};
export const updateEspacio = async (id, data) => {
    return Espacio.findByIdAndUpdate(id, data, { returnDocument: "after", new: true });
};
export const deleteEspacio = async (id) => {
    return Espacio.findByIdAndDelete(id);
};
export const setOcupado = async (id, ocupado) => {
    return Espacio.findByIdAndUpdate(id, { ocupado }, { returnDocument: "after", new: true });
};
