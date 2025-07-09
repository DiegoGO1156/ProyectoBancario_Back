import { request, response } from "express";
import Service from './service.model.js';
import Brand from '../brands/brand.model.js';
import User from "../users/user.model.js";
import jwt from "jsonwebtoken";

export const getServices = async (req = request, res = response) => {
    try {
        const token = req.header("Authorization")
        const {uid} = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const currentUser = await User.findById(uid)
        const services = await Service.find({status:true})
        let servicesResult = []
        services.map(localService=>{
            if(localService.exclusive == true){
                if(currentUser.income >= localService.exclusivitive){
                    servicesResult.push(localService)
                }
            } else {
                servicesResult.push(localService)
            }
        })

        servicesResult.sort((a, b) => {
          if (a.exclusive === b.exclusive) return 0
          return a.exclusive ? -1 : 1
        })

        return res.status(200).json({
            success: true,
            servicesResult
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error getting services',
            error
        });
    }
}

export const getServicesBydId = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findById(id);

        return res.status(200).json({
            success: true,
            service
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error getting service',
            error
        });
    }
}

export const createService = async (req, res) => {
    try {
        const data = req.body;

        const brand = await Brand.findOne({ nameBrand: data.brand })

        const service = new Service({
            ...data,
            brand: brand._id
        })

        await service.save();

        return res.status(200).json({
            success: true,
            service
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating service',
            error
        });
    }
}

export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, brand, ...data } = req.body;

        const updatedService = await Service.findByIdAndUpdate(id, data, { new: true });

        return res.status(200).json({
            success: true,
            msg: 'Service successfully updated',
            service: updatedService
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error updating service',
            error: error.message
        })
    }
}

export const deleteService = async (req, res) => {

    const { id } = req.params;

    try {
        
        await Service.findByIdAndUpdate(id, { status: false })

        return res.status(200).json({
            success: true,
            message: 'Service successfully removed',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting service',
            error
        });
    }
}