const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.get('/products', storeController.getProducts);
router.post('/products/add', storeController.addProduct);
router.post('/store/sell', storeController.sellProduct);
router.get('/transactions', storeController.getTransactions);

module.exports = router;