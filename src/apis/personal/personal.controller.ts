import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
    findAllPersonal,
    findPersonalById,
    createPersonal,
    updatePersonal,
    deletePersonal,
    findPersonalByDepartamento,
    findPersonalByEstatus,
    findPersonalConUbicacion,
    findProfesorConUbicacion,
    buscarPersonal
} from './personal.service.js';
import { PersonalModel } from './personal.model.js';

/**
 * Obtener todo el personal
 */
export const getAllPersonal = async (req: Request, res: Response) => {
    try {
        const personal = await findAllPersonal();
        res.status(200).json({
            success: true,
            count: personal.length,
            data: personal
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener personal',
            error: error.message
        });
    }
};

/**
 * Obtener personal por ID
 */
export const getPersonalById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const personal = await findPersonalById(id);

        if (!personal) {
            return res.status(404).json({
                success: false,
                message: 'Personal no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: personal
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener personal',
            error: error.message
        });
    }
};

/**
 * Crear nuevo personal
 */
export const createNewPersonal = async (req: Request, res: Response) => {
    try {
        const personalData = req.body;
        const newPersonal = await createPersonal(personalData);

        res.status(201).json({
            success: true,
            message: 'Personal creado exitosamente',
            data: newPersonal
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: 'Error al crear personal',
            error: error.message
        });
    }
};

/**
 * Actualizar personal
 */
export const updatePersonalById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const personalData = req.body;
        const updatedPersonal = await updatePersonal(id, personalData);

        if (!updatedPersonal) {
            return res.status(404).json({
                success: false,
                message: 'Personal no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Personal actualizado exitosamente',
            data: updatedPersonal
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar personal',
            error: error.message
        });
    }
};

/**
 * Eliminar personal
 */
export const deletePersonalById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const deletedPersonal = await deletePersonal(id);

        if (!deletedPersonal) {
            return res.status(404).json({
                success: false,
                message: 'Personal no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Personal eliminado exitosamente',
            data: deletedPersonal
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar personal',
            error: error.message
        });
    }
};

/**
 * Obtener personal por departamento
 */
export const getPersonalByDepartamento = async (req: Request, res: Response) => {
    try {
        const { departamento } = req.params;

        if (typeof departamento !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Departamento inválido'
            });
        }

        const personal = await findPersonalByDepartamento(departamento);

        res.status(200).json({
            success: true,
            count: personal.length,
            data: personal
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener personal por departamento',
            error: error.message
        });
    }
};

/**
 * Obtener personal por estatus
 */
export const getPersonalByEstatus = async (req: Request, res: Response) => {
    try {
        const { estatus } = req.params;

        if (typeof estatus !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Estatus inválido'
            });
        }

        const personal = await findPersonalByEstatus(estatus);

        res.status(200).json({
            success: true,
            count: personal.length,
            data: personal
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener personal por estatus',
            error: error.message
        });
    }
};

export const getPersonalConUbicacion = async (req: Request, res: Response) => {
    try {
        const { departamento } = req.params;
        
        if (typeof departamento !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Departamento inválido'
            });
        }

        const resultado = await findPersonalConUbicacion(departamento);

        res.status(200).json({
            success: true,
            data: resultado
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener personal con ubicación',
            error: error.message
        });
    }
};

/**
 * Obtener información de un profesor con su ubicación
 */
export const getProfesorConUbicacion = async (req: Request, res: Response) => {
    try {
        const { numeroEmpleado } = req.params;
        
        if (typeof numeroEmpleado !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Número de empleado inválido'
            });
        }

        const resultado = await findProfesorConUbicacion(numeroEmpleado);

        if (!resultado) {
            return res.status(404).json({
                success: false,
                message: 'Profesor no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: resultado
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del profesor',
            error: error.message
        });
    }
};

export const searchPersonal = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        
        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Término de búsqueda requerido'
            });
        }

        const resultados = await buscarPersonal(q.trim());

        res.status(200).json({
            success: true,
            count: resultados.length,
            data: resultados
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error en la búsqueda',
            error: error.message
        });
    }
};

/**
 * Hashear password de personal existente
 */
export const hashExistingPassword = async (req: Request, res: Response) => {
    try {
        const { numeroEmpleado, newPassword } = req.body;

        if (!numeroEmpleado || typeof numeroEmpleado !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Número de empleado es requerido'
            });
        }

        if (!newPassword || typeof newPassword !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Nueva contraseña es requerida'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        const personal = await PersonalModel.findOne({ numeroEmpleado }).select('+password');
        
        if (!personal) {
            return res.status(404).json({
                success: false,
                message: 'Personal no encontrado'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        personal.password = hashedPassword;
        await personal.save();

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada y hasheada exitosamente',
            data: {
                numeroEmpleado: personal.numeroEmpleado,
                email: personal.email,
                nombre: `${personal.nombre} ${personal.apellidoPaterno} ${personal.apellidoMaterno}`
            }
        });
    } catch (error: any) {
        console.error('Error al hashear password:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar contraseña',
            error: error.message
        });
    }
};

/**
 * Hashear todos los passwords sin hashear en la base de datos
 */
export const hashAllPasswords = async (req: Request, res: Response) => {
    try {
        const allPersonal = await PersonalModel.find({}).select('+password');
        
        let updatedCount = 0;
        let alreadyHashedCount = 0;
        const errors: string[] = [];

        for (const personal of allPersonal) {
            try {
                if (personal.password.startsWith('$2')) {
                    alreadyHashedCount++;
                    continue;
                }

                const salt = await bcrypt.genSalt(10);
                personal.password = await bcrypt.hash(personal.password, salt);
                await personal.save();
                
                updatedCount++;
                console.log(`✅ Password hasheado para: ${personal.email}`);
            } catch (error: any) {
                const errorMsg = `Error con ${personal.email}: ${error.message}`;
                errors.push(errorMsg);
                console.error(`❌ ${errorMsg}`);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Proceso de hasheo completado',
            data: {
                total: allPersonal.length,
                actualizados: updatedCount,
                yaHasheados: alreadyHashedCount,
                errores: errors.length,
                detalleErrores: errors
            }
        });
    } catch (error: any) {
        console.error('Error al hashear passwords:', error);
        res.status(500).json({
            success: false,
            message: 'Error al hashear passwords',
            error: error.message
        });
    }
};

/**
 * Actualizar imagen de perfil del personal
 */
export const updatePersonalProfileImage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { imagenPerfil } = req.body;

        if (typeof id !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        if (!imagenPerfil) {
            return res.status(400).json({
                success: false,
                message: 'URL de imagen es requerida'
            });
        }

        const personal = await PersonalModel.findByIdAndUpdate(
            id,
            { imagenPerfil },
            { new: true }
        );

        if (!personal) {
            return res.status(404).json({
                success: false,
                message: 'Personal no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Imagen de perfil actualizada exitosamente',
            data: personal
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar imagen de perfil',
            error: error.message
        });
    }
};

/**
 * Eliminar imagen de perfil del personal
 */
export const deletePersonalProfileImage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const personal = await PersonalModel.findByIdAndUpdate(
            id,
            { imagenPerfil: null },
            { new: true }
        );

        if (!personal) {
            return res.status(404).json({
                success: false,
                message: 'Personal no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Imagen de perfil eliminada exitosamente',
            data: personal
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar imagen de perfil',
            error: error.message
        });
    }
};