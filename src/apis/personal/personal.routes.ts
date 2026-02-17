import { Router } from 'express';
import {
    getAllPersonal,
    getPersonalById,
    createNewPersonal,
    updatePersonalById,
    deletePersonalById,
    getPersonalByDepartamento,
    getPersonalByEstatus,
    getPersonalConUbicacion,
    getProfesorConUbicacion,
    searchPersonal,
    hashExistingPassword,
    hashAllPasswords,
    updatePersonalProfileImage,
    deletePersonalProfileImage
} from './personal.controller.js';

const router = Router();

// Rutas para hashear passwords (colócalas antes de las rutas con parámetros)
router.post('/hash-password', hashExistingPassword);
router.post('/hash-all-passwords', hashAllPasswords);

// Rutas de búsqueda
router.get('/buscar', searchPersonal);
router.get('/departamento/:departamento', getPersonalByDepartamento);
router.get('/estatus/:estatus', getPersonalByEstatus);
router.get('/ubicacion/departamento/:departamento', getPersonalConUbicacion);
router.get('/ubicacion/profesor/:numeroEmpleado', getProfesorConUbicacion);

// Rutas CRUD
router.get('/', getAllPersonal);
router.get('/:id', getPersonalById);
router.post('/', createNewPersonal);
router.put('/:id', updatePersonalById);
router.put('/:id/profile-image', updatePersonalProfileImage);
router.delete('/:id/profile-image', deletePersonalProfileImage);
router.delete('/:id', deletePersonalById);

export default router;