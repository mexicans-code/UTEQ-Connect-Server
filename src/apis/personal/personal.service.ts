import Personal from './personal.model.js';
import User from '../user/user.model.js';

export const findAllPersonal = async () => {
  try {
    const personal = await Personal.find()
      .populate('edificioId')
      .populate({ path: 'usuario', select: '-passwordHash' })
      .sort({ apellidoPaterno: 1 });
    return personal;
  } catch (error) {
    throw new Error('Error obteniendo personal');
  }
};

export const findPersonalById = async (id: string) => {
  try {
    const personal = await Personal.findById(id)
      .populate('edificioId')
      .populate({ path: 'usuario', select: '-passwordHash' });
    return personal;
  } catch (error) {
    throw new Error('Error obteniendo personal');
  }
};

export const findPersonalByNumeroEmpleado = async (numeroEmpleado: string) => {
  try {
    const personal = await Personal.findOne({ numeroEmpleado })
      .populate('edificioId')
      .populate({ path: 'usuario', select: '-passwordHash' });
    return personal;
  } catch (error) {
    throw new Error('Error obteniendo personal por número de empleado');
  }
};

export const findPersonalByEmail = async (email: string) => {
  try {
    const personal = await Personal.findOne({ email })
      .populate('edificioId')
      .populate({ path: 'usuario', select: '-passwordHash' });
    return personal;
  } catch (error) {
    throw new Error('Error obteniendo personal por email');
  }
};

export const findPersonalByUserId = async (userId: string) => {
  try {
    const personal = await Personal.findOne({ usuario: userId })
      .populate('edificioId')
      .populate({ path: 'usuario', select: '-passwordHash' });
    return personal;
  } catch (error) {
    throw new Error('Error obteniendo personal por usuario');
  }
};

export const createPersonal = async (personalData: any) => {
  try {
    // 1. Crear el usuario primero con rol "admin"
    const user = new User({
      nombre: `${personalData.nombre} ${personalData.apellidoPaterno} ${personalData.apellidoMaterno || ''}`.trim(),
      email: personalData.email,
      passwordHash: personalData.passwordHash || 'temporal123',
      rol: "admin",
      estatus: "activo"
    });
    await user.save();

    // 2. Crear el registro de personal vinculado al usuario
    const personal = new Personal({
      ...personalData,
      usuario: user._id
    });
    await personal.save();

    return await personal.populate(['edificioId', { path: 'usuario', select: '-passwordHash' }]);
  } catch (error) {
    throw error;
  }
};

export const updatePersonal = async (id: string, personalData: any) => {
  try {
    const personal = await Personal.findByIdAndUpdate(
      id,
      personalData,
      { new: true, runValidators: true }
    )
      .populate('edificioId')
      .populate({ path: 'usuario', select: '-passwordHash' });
    return personal;
  } catch (error) {
    throw error;
  }
};

export const deletePersonal = async (id: string) => {
  try {
    const personal = await Personal.findById(id);
    if (!personal) {
      throw new Error('Personal no encontrado');
    }

    // Eliminar también el usuario asociado
    await User.findByIdAndDelete(personal.usuario);
    
    // Eliminar el registro de personal
    await Personal.findByIdAndDelete(id);
    
    return personal;
  } catch (error) {
    throw error;
  }
};

export const updateEstatus = async (id: string, estatus: "dentro" | "fuera") => {
  try {
    const personal = await Personal.findByIdAndUpdate(
      id,
      { estatus },
      { new: true }
    )
      .populate('edificioId')
      .populate({ path: 'usuario', select: '-passwordHash' });
    return personal;
  } catch (error) {
    throw new Error('Error actualizando estatus');
  }
};

export const findPersonalByCargo = async (cargo: string) => {
  try {
    const personal = await Personal.find({ cargo })
      .populate('edificioId')
      .populate({ path: 'usuario', select: '-passwordHash' })
      .sort({ apellidoPaterno: 1 });
    return personal;
  } catch (error) {
    throw new Error('Error obteniendo personal por cargo');
  }
};

export const findPersonalByEdificio = async (edificioId: string) => {
  try {
    const personal = await Personal.find({ edificioId })
      .populate('edificioId')
      .populate({ path: 'usuario', select: '-passwordHash' })
      .sort({ apellidoPaterno: 1 });
    return personal;
  } catch (error) {
    throw new Error('Error obteniendo personal por edificio');
  }
};

export const findPersonalDentro = async () => {
  try {
    const personal = await Personal.find({ estatus: "dentro" })
      .populate('edificioId')
      .populate({ path: 'usuario', select: '-passwordHash' })
      .sort({ apellidoPaterno: 1 });
    return personal;
  } catch (error) {
    throw new Error('Error obteniendo personal dentro');
  }
};

export const findPersonalFuera = async () => {
  try {
    const personal = await Personal.find({ estatus: "fuera" })
      .populate('edificioId')
      .populate({ path: 'usuario', select: '-passwordHash' })
      .sort({ apellidoPaterno: 1 });
    return personal;
  } catch (error) {
    throw new Error('Error obteniendo personal fuera');
  }
};

export const searchPersonal = async (searchTerm: string) => {
  try {
    const personal = await Personal.find({
      $or: [
        { nombre: { $regex: searchTerm, $options: 'i' } },
        { apellidoPaterno: { $regex: searchTerm, $options: 'i' } },
        { apellidoMaterno: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { numeroEmpleado: { $regex: searchTerm, $options: 'i' } }
      ]
    })
      .populate('edificioId')
      .populate({ path: 'usuario', select: '-passwordHash' })
      .sort({ apellidoPaterno: 1 });
    return personal;
  } catch (error) {
    throw new Error('Error buscando personal');
  }
};