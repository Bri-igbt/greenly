import express from 'express'
import auth from '../middleware/auth';
import { addAddress, deleteAddress, getAddresses, updateAddress } from '../controllers/addressController';

const addressRouter = express.Router();

addressRouter.get('/', auth, getAddresses)
addressRouter.post('/', auth, addAddress)
addressRouter.put('/:id', auth, updateAddress)
addressRouter.delete('/:id', auth, deleteAddress)

export default addressRouter;