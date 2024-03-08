const Joi = require("joi");

exports.jobValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .message("The name of job must be at least 2 characters")
      .max(35)
      .message("The name of job must be at most 35 characters"),
    description: Joi.string()
      .min(5)
      .message("The description must be at least 35 characters"),
    icon: Joi.string(),
  });

  return schema.validate(data, { abortEarly: true });
};
