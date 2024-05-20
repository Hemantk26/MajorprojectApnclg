const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.array().items(Joi.string().allow("", null)),
        price: Joi.number().required().min(0),
        Contact: Joi.number().required(),
        Pin: Joi.string().required(),
        DistState: Joi.string().required(),
        // District: Joi.string().required(),
        // State: Joi.string().required(),
        Address: Joi.string().required(),
        locationLink: Joi.string().required(),
    }).required(),
});

module.exports.reviewSchema =Joi.object({
      review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
      }).required(),
});