const Joi = require("joi");

exports.vacancyValidation = (data) => {
  const schema = Joi.object({
    employer_id: Joi.string(),
    city: Joi.string(),
    job_id: Joi.string(),
    salary: Joi.number(),
    description: Joi.string()
      .min(35)
      .message("The description must be at most 35 characters")
      .max(250),
    requirements: Joi.string().min(3).max(100),
    internship: Joi.string().min(3).max(100),
    job_type: Joi.string().max(50),
    work_hour: Joi.string().max(50),
    is_medicine: Joi.boolean().default(false),
    is_housing: Joi.boolean().default(false),
    gender: Joi.string().max(50),
    age_limit: Joi.string().max(50),
    education: Joi.string().max(150),
    exprience: Joi.string().max(250),
    trial_period: Joi.string().max(255),
  });

  return schema.validate(data, { abortEarly: true });
};
