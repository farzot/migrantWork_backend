const Joi = require("joi");

exports.adminValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().pattern(new RegExp(`[a-zA-Z]+$`)).min(2).max(50),
    email: Joi.string().email(),
    hashed_password: Joi.string().min(6),
    phone_number: Joi.string().pattern(new RegExp(/^\d{2}-\d{3}-\d{2}-\d{2}$/)),
    tg_link: Joi.string().min(5),
    is_active: Joi.boolean().default(false),
    is_creater: Joi.boolean().default(false),
    hashed_refresh_token: Joi.string().min(5),
    description: Joi.string().min(5),
  });

  return schema.validate(data, { abortEarly: true });
};

exports.adminLoginValidation = (data) => {
  const schema = Joi.object({
    admin_password: Joi.string().min(6),
    confirm_password: Joi.ref("admin_password"),
    admin_email: Joi.string().email(),
  });
  return schema.validate(data, { abortEarly: false });
};
