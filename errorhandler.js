const handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
};

const handleIncorrectUserName = (err, req, res, next) => {
  if (err.code === "23503") {
    res.status(400).send({ msg: "Incorrect username" });
  }
  next(err);
};

const handlePsqlErrors = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  }
  next(err);
};

const handleServerErrors = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
};

const handleNotFound = (req, res) => {
  res.status(404).send({ msg: "Page not found" });
};

module.exports = {
  handleCustomErrors,
  handleIncorrectUserName,
  handleServerErrors,
  handlePsqlErrors,
  handleNotFound,
};
