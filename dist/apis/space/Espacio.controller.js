import * as espacioService from "./Espacio.service";
export const getEspacios = async (req, res) => {
    try {
        const espacios = await espacioService.findAllEspacios();
        res.json({ success: true, data: espacios });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Error desconocido" });
    }
};
export const getEspacioById = async (req, res) => {
    try {
        const espacio = await espacioService.findEspacioById(req.params.id);
        if (!espacio)
            return res.status(404).json({ success: false, error: "Espacio no encontrado" });
        res.json({ success: true, data: espacio });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Error desconocido" });
    }
};
export const getEspaciosByDestino = async (req, res) => {
    try {
        const espacios = await espacioService.findEspaciosByDestino(req.params.destinoId);
        res.json({ success: true, data: espacios });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Error desconocido" });
    }
};
export const getEspaciosDisponiblesByDestino = async (req, res) => {
    try {
        const espacios = await espacioService.findEspaciosDisponiblesByDestino(req.params.destinoId);
        res.json({ success: true, data: espacios });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Error desconocido" });
    }
};
export const createEspacio = async (req, res) => {
    try {
        const { nombre, destino, cupos, planta, descripcion } = req.body;
        if (!nombre || !destino || !cupos || !planta) {
            return res.status(400).json({ success: false, error: "Faltan datos requeridos: nombre, destino, cupos, planta" });
        }
        const espacio = await espacioService.createEspacio({ nombre, destino, cupos, planta, descripcion, ocupado: false });
        res.status(201).json({ success: true, message: "Espacio creado exitosamente", data: espacio });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error instanceof Error ? error.message : "Error desconocido" });
    }
};
export const updateEspacio = async (req, res) => {
    try {
        const espacio = await espacioService.updateEspacio(req.params.id, req.body);
        if (!espacio)
            return res.status(404).json({ success: false, error: "Espacio no encontrado" });
        res.json({ success: true, message: "Espacio actualizado exitosamente", data: espacio });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error instanceof Error ? error.message : "Error desconocido" });
    }
};
export const deleteEspacio = async (req, res) => {
    try {
        const deleted = await espacioService.deleteEspacio(req.params.id);
        if (!deleted)
            return res.status(404).json({ success: false, error: "Espacio no encontrado" });
        res.json({ success: true, message: "Espacio eliminado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Error desconocido" });
    }
};
export const toggleOcupado = async (req, res) => {
    try {
        const { ocupado } = req.body;
        if (typeof ocupado !== "boolean") {
            return res.status(400).json({ success: false, error: "El campo 'ocupado' debe ser boolean" });
        }
        const espacio = await espacioService.setOcupado(req.params.id, ocupado);
        if (!espacio)
            return res.status(404).json({ success: false, error: "Espacio no encontrado" });
        res.json({ success: true, message: `Espacio marcado como ${ocupado ? "ocupado" : "disponible"}`, data: espacio });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Error desconocido" });
    }
};
