const { registerUser,userEvents,authenticateUser,
    updatePassword,resetPassword,createEvents,updateEvent,
    detailEvent,createInvite,acceptInvite,rejectInvite,searchEvents,paginateEvents
  } = require('../controllers/user')

const resolvers = {
    Mutation:{
        registerUser: async (parent,arg) => {
            return await registerUser(parent,arg)
        },
        authenticateUser : async (parent,arg) => {
            return await authenticateUser(parent,arg)
        },
        updatePassword: async (parent,arg) => {
            return await updatePassword(parent,arg)
        },
        resetPassword: async (parent,arg) => {
            return await resetPassword(parent,arg)
        },
        createEvents: async (parent,arg) => {
            return await createEvents(parent,arg)
        },
        updateEvent: async (parent,arg) => {
            return await updateEvent(parent,arg)
        },
        createInvite: async (parent,arg) => {
            return await createInvite(parent,arg)
        },
        acceptInvite: async (parent,arg) => {
            return await acceptInvite(parent,arg)
        },
        rejectInvite: async (parent,arg) => {
            return await rejectInvite(parent,arg)
        }
    },
    Query: {
        userEvents: async (parent,arg) => {
            return await userEvents(parent,arg)
        },
        detailEvent: async (parent,arg) => {
            return await detailEvent(parent,arg)
        },
        searchEvents: async (parent,arg) => {
            return await searchEvents(parent,arg)
        },
        paginateEvents: async (parent,arg) => {
            return await paginateEvents(parent,arg)
        }
    }
}

module.exports = resolvers


