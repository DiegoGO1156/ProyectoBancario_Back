export const validatePassword = (password) => {

    if (!password || password.length < 8) {
      return {
        isValid: false,
        message: "The password must be at least 8 characters long",
        strength: 0
      };
    }
  
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isCommonPassword = ["password", "12345678", "qwerty"].includes(password.toLowerCase());
  
    let strength = 0;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecialChars) strength++;
  
    if (isCommonPassword) {
      return {
        isValid: false,
        message: "This password is very common and vulnerable",
        strength: 0
      };
    }
  
    if (!hasUpperCase) {
        return {
          isValid: false,
          message: "The password must contain at least one uppercase letter",
          strength
        };
      }
    
      if (!hasSpecialChars) {
        return {
          isValid: false,
          message: "The password must contain at least one special character",
          strength
        };
      }
    
      if (strength < 3) {
        return {
          isValid: false,
          message: "The password is weak. It must include more variety of characters",
          strength
        };
      }
  
    return {
      isValid: true,
      message: "Secure password",
      strength
    };
  };

export const passwordValidatorMiddleware = (req, res, next) => {
  const { password } = req.body;
  
  const validation = validatePassword(password);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: validation.message,
      strength: validation.strength
    });
  }
  
  req.passwordStrength = validation.strength;
  next();
};