const Joi = require("joi");

exports.countryValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .message("The name of country must be at least 2 characters")
      .max(35)
      .message("The name of country must be at most 35 characters"),
    flag: Joi.string(),
  });

  return schema.validate(data, { abortEarly: true });
};
