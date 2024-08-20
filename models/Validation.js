const Joi = require('joi')

const joiUserSchema =Joi.object({
    name:Joi.string().alphanum().min(3).max(30).required(),
    email:Joi.string().email().required(),
    password:Joi.string().required(),

})

const joiProductSchema =Joi.object({
    id:Joi.string(),
    name: Joi.string().required(),
    description:Joi.string(),
    price: Joi.number().positive(),
    image: Joi.string(),
    category:Joi.string(),
})


module.exports={
    joiUserSchema,
    joiProductSchema
}