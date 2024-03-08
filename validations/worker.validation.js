const Joi = require("joi");

exports.workerValidation = (data) => {
  const schema = Joi.object({
    first_name: Joi.string()
      .min(2)
      .message("The name  must be at least 2 characters")
      .max(35)
      .message("The name  must be at most 55 characters"),
    last_name: Joi.string()
      .min(2)
      .message("The lastname must be at least 2 characters")
      .max(35)
      .message("The lastname must be at most 55 characters"),
    birth_date: Joi.date(),
    gender: Joi.string().max(10),
    passport: Joi.string().max(25),
    phone_number: Joi.string().pattern(new RegExp(/^\d{2}-\d{3}-\d{2}-\d{2}$/)),
    email: Joi.string().email().max(75).required(true),
    hashed_password: Joi.string().max(250).required(true),
    hashed_refresh_token: Joi.string().max(250),
    is_active: Joi.boolean().default(false),
    education: Joi.string().max(55),
    skills: Joi.string().max(105),
    exprience: Joi.string(),
  });

  return schema.validate(data, { abortEarly: true });
};

exports.workerLoginValidation = (data) => {
  const schema = Joi.object({
    worker_password: Joi.string().min(6),
    confirm_password: Joi.ref("worker_password"),
    worker_email: Joi.string().email(),
  });
  return schema.validate(data, { abortEarly: false });
};
