const Joi = require('joi')

const joiUserSchema =Joi.object({
    email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),

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