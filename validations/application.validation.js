const Joi = require("joi");

exports.applicationValidation = (data) => {
  const schema = Joi.object({
    vacancy_id: Joi.bigint(),
    worker_id: Joi.bigint(),
    application_date: Joi.timestamp(),
  });

  return schema.validate(data, { abortEarly: true });
};
