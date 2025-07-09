import { request, response } from "express";
import Product from './product.model.js';
import Brand from '../brands/brand.model.js';

export const getProducts = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0} = req.query;
        const query = { status: true};

        const [total, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        return res.status(200).json({
            success: true,
            total,
            products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error getting products',
            error
        });
    }
}

export const getProductsById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        return res.status(200).json({
            success: true,
            product
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error getting the product',
            error
        });
    }
}

export const createProduct = async (req, res) => {
    try {
        const data = req.body;

        const brand = await Brand.findOne({ nameBrand: data.brand })

        const product = new Product({
            ...data,
            brand: brand._id
        })

        await product.save();

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating product',
            error
        });
    }
}

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, brand, ...data } = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true });

        return res.status(200).json({
            success: true,
            msg: 'Successfully updated product',
            product: updatedProduct
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error updating the product',
            error: error.message
        });
    }
}

export const deleteProduct = async (req, res) => {

    const { id } = req.params;

    try {

        await Product.findByIdAndUpdate(id, { status: false });

        return res.status(200).json({
            success: true,
            message: 'Product successfully removed',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error
        });
    }
}