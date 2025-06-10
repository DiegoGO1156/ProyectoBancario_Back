import User from "../users/user.model.js"

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////// LOGIN ////////////////////////////////////////////////////////////////////////////////////
export const pendingAccount = async(email = "" )=>{
    const isPending = await User.findOne({email})
    if(isPending.statusAccount === "Pending"){
        throw new Error (`Your account is still pending confirmation, please wait until it is enabled`)
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////