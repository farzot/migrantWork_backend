const Joi = require("joi");

exports.workerJobValidation = (data) => {
  const schema = Joi.object({
    worker_id: Joi.bigint(),
    job_id: Joi.bigint(),
  });
  return schema.validate(data, { abortEarly: true });
};
