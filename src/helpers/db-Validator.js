import User from "../users/user.model.js"
import Brand from "../brands/brand.model.js"
import Product from "../products/product.model.js"
import Service from "../services/service.model.js"

////////////////////////////////////////////////////////////////////////////// REGISTER ////////////////////////////////////////////////////////////////////////////////////
export const emailUsed = async(email = "") =>{
    const emailLower = email.toLowerCase()
    const emailUsed = await User.findOne({email: emailLower})
    if(emailUsed){
        throw new Error (`The email ${email} has already been registered`)
    }
}

export const usedUsername = async(username = "") =>{
    const usernameLower = username.toLowerCase()
    const usernameUsed = await User.findOne({username: usernameLower})
    if(usernameUsed){
        throw new Error (`The username ${username} has already been registered`)
    }
}

export const minincome = async(income = "") =>{
    if(income < 100){
        throw new Error (`The minimum income must be 100`)
    }
}

export const usedPhone = async(phone = "") =>{
    const phoneUsed = await User.findOne({phone})
    if(phoneUsed){
        throw new Error (`The phone ${phone} has already been registered`)
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////// LOGIN ////////////////////////////////////////////////////////////////////////////////////
export const pendingAccount = async(email = "" )=>{
    const emailLower = email.toLowerCase()
    const isPending = await User.findOne({email: emailLower})
    if(isPending.statusAccount === "Pending"){
        throw new Error (`Your account is still pending confirmation, please wait until it is enabled`)
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////// BRAND ////////////////////////////////////////////////////////////////////////////////////
export const noExistBrandById = async (id = ' ') => {

    const existBrand = await Brand.findById(id);
    if(!existBrand){
        throw new Error(`The ID ${id} does not exist`);
    }
}

export const notExistBrand = async (nameBrand = ' ') => {

    const existNameBrand = await Brand.findOne({nameBrand})
    
    if(!existNameBrand){
        throw new Error (`The brand ${nameBrand} does not exist`)
    }
}

export const brandDisabled = async (nameBrand = ' ') => {

    const existNameBrand = await Brand.findOne({nameBrand})
    
    if(existNameBrand.status === false){
        throw new Error (`The brand ${nameBrand} now is disabled`)
    }
}

export const existBrandName = async (nameBrand = ' ') => {
    const existBrand = await Brand.findOne({nameBrand});
    if(existBrand){
        throw new Error(`The brand ${nameBrand} already exists`)
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////// PRODUCT ////////////////////////////////////////////////////////////////////////////////////
export const noExistProductById = async (id = ' ') => {
    const existProduct = await Product.findById(id);
    if(!existProduct){
        throw new Error(`The ID ${id} does not exist`);
    }
}

export const existProductName = async (nameProduct = ' ') => {
    const existProduct = await Product.findOne({nameProduct});
    if(existProduct){
        throw new Error(`The product ${nameProduct} already exist`);
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////// SERVICE ////////////////////////////////////////////////////////////////////////////////////
export const existServiceById = async (id = ' ') => {

    const existService = await Service.findById(id);

    if(!existService){
        throw new Error(`The ID ${id} does not exist`);
    }
}

export const existServiceName = async(nameService = "") =>{
    const existService = await Service.findOne({nameService})
    if(existService){
        throw new Error (`The service ${nameService} has already been registered`)        
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////// ADMIN ////////////////////////////////////////////////////////////////////////////////////

export const noExistUserById = async (id = ' ') => {

    const existUser = await User.findById(id);
    if(!existUser){
        throw new Error(`The user with ID ${id} does not exist`);
    }
}

export const notExistUser = async (email = ' ') => {

    const existEmail = await User.findOne({email})
    
    if(!existEmail){
        throw new Error (`The email ${email} does not exist`)
    }
}

export const userDisabled = async (email = ' ') => {
    
    const existEmail = await User.findOne({email})
    
    if(existEmail.status === false){
        throw new Error (`The email ${email} now is disabled`)
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
