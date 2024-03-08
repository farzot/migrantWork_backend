const errorHandler = (res, err) => {
  res.status(400).send({
    error: `Error: ${err}`,
  });
};

module.exports = { errorHandler };
