// location.routes.ts
import * as express from 'express';
import { getLocations, getAllAddresses } from './location.controller.js';
const router = express.Router();
router.get('/', getLocations);
router.get('/getAllAddresses', getAllAddresses);
export default router;
