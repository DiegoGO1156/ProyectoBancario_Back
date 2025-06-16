import { request, response } from "express";
import Brand from './brand.model.js';

export const getBrands = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0} = req.query;
        const query = { status: true};

        const [total, brands] = await Promise.all([
            Brand.countDocuments(query),
            Brand.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        return res.status(200).json({
            success: true,
            total,
            brands
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error getting marks',
            error
        })
    }
}

export const getBrandsById = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await Brand.findById(id);

        return res.status(200).json({
            success: true,
            brand
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting the brand',
            error: error.message
        })
    }
}

export const createBrand = async (req, res) => {
    try {
        const data = req.body;

        const brand = await Brand.create({
            ...data
        })

        return res.status(200).json({
            success: true,
            brand
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating brand',
            error: error.message
        });
    }
}

export const updateBrand = async(req, res = response) => {
    try {
        const { id } = req.params;
        const { _id, ...data } = req.body;

        const brand = await Brand.findByIdAndUpdate(id, data, {new: true});

        return res.status(200).json({
            success: true,
            msg: 'Updated brand',
            brand
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error updating the brand',
            error: error.message
        });
    }
}

export const deleteBrand = async (req, res) => {

    const { id } = req.params;

    try {
        
        await Brand.findByIdAndUpdate(id, { status: false })

        return res.status(200).json({
            success: true,
            message: 'Mark successfully removed',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error deleting the mark',
            error: error.message
        });
    }
}