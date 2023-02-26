const joi = require('joi')

const validateRegistration = (data) => {
    const userSchema = joi.object({
        name:joi.string().min(2).max(25).required(),
        email:joi.string().email().required(),
        password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    })

    return userSchema.validate(data)
}

const validateAuthentication = (data) => {
    const userSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    })

    return userSchema.validate(data)
}

const validateChangePassword = (data) => {
    const passwordSchema = joi.object({
        id: joi.number().required(),
        oldPassword: joi.string().required(),
        newPassword: joi.string().required()
    })

    return passwordSchema.validate(data)
}

const validateResetPassword = (data) => {
    const resetSchema = joi.object({
        "name":joi.string().required(),
        "email":joi.string().email().required()
    })

    return resetSchema.validate(data)
}

const validateCreateEvent = (data) => {
    const eventSchema = joi.object({
        "userId": joi.number().required(),
        "name":joi.string().required(),
        "description":joi.string().required()
    })

    return eventSchema.validate(data)
}

const validateUpdateEvent = (data) => {
    const eventSchema = joi.object({
        "id": joi.number().required(),
        "userId": joi.number().required(),
        "name":joi.string().required(),
        "description":joi.string().required()
    })

    return eventSchema.validate(data)
}

const validateCreateInvite = (data) => {
    const inviteSchema = joi.object({
        "email": joi.string().required(),
        "userId": joi.number().required(),
        "eventId": joi.number().required(),
    })

    return inviteSchema.validate(data)
}
module.exports = { validateRegistration, validateAuthentication, validateChangePassword,
    validateResetPassword, validateCreateEvent, validateCreateInvite,validateUpdateEvent }
