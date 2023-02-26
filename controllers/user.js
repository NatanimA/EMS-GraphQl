const { validateRegistration, validateAuthentication, validateChangePassword, validateResetPassword, validateCreateEvent, validateCreateInvite, validateUpdateEvent } = require('../validations')
var User = require('../models').User;
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
var Invite = require('../models').Invite;
var Event = require('../models').Event;
const Member = require('../models').Member;
const { GraphQLError} = require('graphql')

const registerUser = async (parent,arg) => {
    try{
        const { error } = validateRegistration(arg)
        if(error) return error.details[0].message
        const userExist = await User.findOne({
            where:{
                email:arg.email
            }
        })
        if(userExist) return "Email is Already taken."
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(arg.password,salt)

        const user = await User.create({
            name: arg.name,
            email: arg.email,
            password: hashedPassword
        })

        return user

    }catch(err){
        return err
    }
}

const authenticateUser = async (parent,arg) => {
    try{
        const { error } = validateAuthentication(arg)
        if (error) return new GraphQLError (error.details[0].message,{
            extensions:{
                code: 'BAD_REQUEST'
            }
        })
        const userExist = await User.findOne({
            where: {
                email: arg.email
            }
        });
        if (!userExist) return new GraphQLError ("User does not exist.",{
            extensions:{
                code: 'FORBIDDEN'
            }
        })
        const match = await bcrypt.compare(arg.password, userExist.password)
        if (!match) return new GraphQLError ("Email or password is not correct",{
            extensions:{
                code: 'FORBIDDEN'
            }
        })

        const loggedUser = await User.findOne({
            where:{
                email:userExist.email
            },
            include: [Event, Invite]
        })
        return loggedUser

    }catch(err){
       return new GraphQLError ("Something went wrong please try again later.",{
            extensions:{
                code: 'INTERNAL_SERVER_ERROR'
            }
        })
    }
}

const logoutUser = (req,res) => {
    try{
        res.clearCookie('auth-system')
        res.cookie('auth-system', { expires: new Date(Date.now - 1) })
        res.status(200).send({
            message: "Successfully logged out"
        })
    }catch(err){
        res.status(500).send("Something went wrong please try again later")
    }
}

const updatePassword = async (parent,arg) => {
    try{
        // Check if request body is correct
        const { error } = validateChangePassword(arg)
        if (error) return new GraphQLError (error.details[0].message,{
            extensions:{
                code: 'BAD_REQUEST'
            }
        })
        const newPassword = arg.newPassword;
        const oldPassword = arg.oldPassword;
        const requestUser = await User.findOne({
            where: {
                id: arg.id
            }
        })

        // Match old user password with the provided one
        const matcher = await bcrypt.compare(oldPassword, requestUser.password)
        if (!matcher) return new GraphQLError ("Password is not correct",{
            extensions:{
                code: 'BAD_REQUEST'
            }
        })

        // Hash the new password
        const salt = await bcrypt.genSalt(10)
        const newHashedPassword = await bcrypt.hash(newPassword, salt)

        // Update the users password
        requestUser.password = newHashedPassword
        requestUser.save({fields:['password']})

        return requestUser;

    }catch(err){
       return new GraphQLError ("Something went wrong please try again later",{
            extensions:{
                code: 'INTERNAL_SERVER_ERROR'
            }
        })
    }
}

const resetPassword = async (parent,arg) => {
    const { error } = validateResetPassword(arg)
    if(error) return new GraphQLError(error.details[0].message,{
        extensions:{
            code: 'BAD_REQUEST'
        }
    })
    const userExist = await User.findOne({
        where:{
            email:{
                [Op.like]: '%'+ arg.email+'%'
            },
            name:{
                [Op.like]: '%'+ arg.name+'%'
            }
        }
    });

    if(!userExist) return new GraphQLError("Email or password is not correct.",{
        extensions:{
            code: 'BAD_REQUEST'
        }
    })
    return userExist
}

const userEvents = async(parent,arg) => {
    try{
        const user = await User.findOne({
            where: {
                id: arg.id
            },
             include: Event
        })
        return user.Events

    }catch(err){
        return "Something went wrong please try again later."
    }
}

const createEvents = async(parent,arg) => {
    try{
        const { error } = validateCreateEvent(arg)
        if(error) return new GraphQLError(error.details[0].message,{
            extensions:{
                code: 'BAD_REQUEST'
            }
        })
        const event = await Event.create({
            userId:arg.userId,
            name:arg.name,
            description:arg.description
        })
        const createdEvent = await Event.findOne({
            where:{
                id: event.id
            },
            include: ['User']
        })
        return createdEvent
    }catch(err){
        return new GraphQLError("Something went wrong please try again later",{
            extensions:{
                code: 'INTERNAL_SERVER_ERROR'
            }
        })
    }
}

const updateEvent = async(parent,arg) => {
    try{
        const { error } = validateUpdateEvent(arg)
        if(error) return new GraphQLError(error.details[0].message,{
            extensions:{
                code: 'BAD_REQUEST'
            }
        })
        const event = await Event.findOne({
            where:{
                id:arg.id
            }
        })
        if(!event) return new GraphQLError("Event does not exist",{
            extensions:{
                code: 'NOT_FOUND'
            }
        })
        if(event.userId !== arg.userId) return new GraphQLError("Access Denied", {
            extensions:{
                code: 'FORBIDDEN'
            }
        })
        if(arg.name !== null && arg.name.length !== 0){
            event.name=arg.name
        }
        if(arg.description !== null && arg.description.length !== 0){
            event.description = arg.description
        }
        if (arg.name !== null && arg.name.length !== 0 &&
            arg.description !== null && arg.description.length !== 0){
                await event.save({fields:['name','description']})
            }
        if (arg.name !== null && arg.name.length !== 0) {
            await event.save({ fields: ['name'] })
        }
        if (arg.description !== null && arg.description.length !== 0) {
            await event.save({ fields: ['description'] })
        }
        const updateEvent = await Event.findOne({
            where:{
                id:arg.id
            },
            include: ['User','Members']
        })
        return updateEvent

    }catch(err){
        return new GraphQLError("Something went wrong please try again later.",{
            extensions:{
                code: 'INTERNAL_SERVER_ERROR'
            }
        })
    }
}

const detailEvent = async(parent,arg) => {
    const event = await Event.findOne({
        where:{
            id:arg.id
        },
        include: ['Members']
    })
    if(!event) return new GraphQLError(`Couldn't find event`,{
        extensions:{
            code: 'NOT_FOUND'
        }
    })
    return event
}

const createInvite = async(parent,arg) => {
    try{
        const { error } = validateCreateInvite(arg)
        if (error) return new GraphQLError(error.details[0].message,{
            extensions:{
                code:'BAD_REQUEST'
            }
        })

        const event = await Event.findOne({
            where: {
                id: arg.eventId
            },
            include: User
        })
        if (!event) return new GraphQLError('Event does not exist',{
            extensions:{
                code: 'BAD_REQUEST'
            }
        })
        const user = await User.findOne({
            where: {
                id: arg.userId
            }
        })
        if (!user) return new GraphQLError('User does not exist',{
            extensions:{
                code: 'BAD_REQUEST'
            }
        })

        const newInvite = await Invite.create({
            eventId: arg.eventId,
            userId: arg.userId,
            status: false,
            owner: arg.email
        })
        const createdInvite = await Invite.findOne({
            where:{
                id:newInvite.id
            },
            include: ['User']
        })
        return createdInvite
    }catch(err){
        return new GraphQLError("Something went wrong please try again later",{
            extensions:{
                code: 'INTERNAL_SERVER_ERROR'
            }
        })
    }

}

const acceptInvite = async(parent,arg) => {
    try{
        const invite = await Invite.findOne({
            where: {
                id: arg.id,
                userId: arg.userId
            }
        })
        if (!invite) return new GraphQLError("Event not found",{
            extensions:{
                code:'BAD_REQUEST'
            }
        })
        const newMember = await Member.create({
            eventId: invite.eventId,
            userId: arg.userId
        })
        await invite.destroy()
        const createdMember  = await Member.findOne({
            where:{
                id:newMember.id,
                include: ['User','Event']
            }
        })
        return createdMember
    }catch(err){
        return new GraphQLError("Something went wrong please try again later",{
            extensions:{
                code: "INTERNAL_SERVER_ERROR"
            }
        })
    }

}

const rejectInvite = async(parent,arg) => {
    try{
        const invite = await Invite.findOne({
            where: {
                id: arg.id,
                userId: arg.userId
            }
        })
        if (!invite) return new GraphQLError("Event could not be found",{
            extensions:{
                code: 'BAD_REQUEST'
            }
        })
        await invite.destroy()
        return "Reject success"
    }catch(err){
        return res.status(500).send(err)
    }
}

const searchEvents = async(parent,arg) => {
    try{
        const events = await Event.findAll({
            where:{
                name:{
                    [Op.like]: `${arg.name}`
                }
            }
        })
        return events
    }catch(err){
        return new GraphQLError("Something went wrong please try again later",{
            extensions:{
                code:'INTERNAL_SERVER_ERROR'
            }
        })
    }

}

const paginateEvents = async(parent,arg) => {
    try{
        const events = await Event.findAll({ offset: arg.page, limit: arg.limit, order: [['createdAt', 'DESC']] })
        return events
    }catch(err){
        return new GraphQLError("Something went wrong please try again later",{
            extensions:{
                code: "INTERNAL_SERVER_ERROR"
            }
        })
    }
}

module.exports = { registerUser, authenticateUser, logoutUser, updatePassword,
    resetPassword, userEvents, createEvents, updateEvent, detailEvent, createInvite,
    acceptInvite,rejectInvite,searchEvents,paginateEvents }
