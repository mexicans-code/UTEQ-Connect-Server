import * as express from 'express';
import { 
    getLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    getAllAddresses,
    uploadLocationImage,
    deleteLocationImage
} from './location.controller.js';
import { upload } from '../../config/multer.config.js';

const router = express.Router();

router.get('/', getLocations);
router.get('/getAllAddresses', getAllAddresses);
router.get('/:id', getLocationById);
router.post('/', upload.single('image'), createLocation);
router.put('/:id', upload.single('image'), updateLocation);
router.delete('/:id', deleteLocation);
router.post('/:id/image', upload.single('image'), uploadLocationImage);
router.delete('/:id/image', deleteLocationImage);

export default router;