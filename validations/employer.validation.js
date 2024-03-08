const Joi = require("joi");

exports.employerValidation = (data) => {
  const schema = Joi.object({
    company_name: Joi.string().pattern(new RegExp(`[a-zA-Z]+$`)).min(2).max(50),
    country_id: Joi.string(),
    address: Joi.string(),
    location: Joi.string().min(3),
    contact_name: Joi.string().min(3),
    contact_passport: Joi.string().min(5),
    contact_email: Joi.string().email(),
    contact_phone: Joi.string().pattern(
      new RegExp(/^\d{2}-\d{3}-\d{2}-\d{2}$/)
    ),
    hashed_password: Joi.string().min(6),
    hashed_refresh_token: Joi.string().min(15),
  });

  return schema.validate(data, { abortEarly: true });
};


exports.employerLoginValidation = (data) => {
  const schema = Joi.object({
    employer_password: Joi.string().min(6),
    confirm_password: Joi.ref("employer_password"),
    employer_email: Joi.string().email(),
  });
  return schema.validate(data, { abortEarly: false });
};