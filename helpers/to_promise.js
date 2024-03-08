const { response } = require("express");

async function to(promise) {
  return promise
    .then((reponse) => [null, response])
    .catch((error) => [error, null]);
}

module.exports = { to };
