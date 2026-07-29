import express from 'express'
import { 
    createProduct, 
    deleteProduct, 
    getFlashDeals, 
    getProduct, 
    getProducts, 
    updateProduct 
} from '../controllers/productController';
import admin from '../middleware/admin';
import auth from '../middleware/auth';

const productRouter = express.Router();

productRouter.get('/flash-deals', getFlashDeals);
productRouter.get('/:id', getProduct);
productRouter.get('/', getProducts);
productRouter.post('/', auth, admin, createProduct);
productRouter.put('/:id', auth, admin, updateProduct);
productRouter.delete('/:id', auth, admin, deleteProduct);

export default productRouter;