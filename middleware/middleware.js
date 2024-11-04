var jwt = require("jsonwebtoken");
const HemayaUser = require("../models/HemayaSchema");

const RequireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err) => {
      if (err) { return res.redirect("/Login") }
      else { return next(); }
    })
  }
  else {
    return res.redirect("/Login")
  }
};

const UnRequireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err) => {
      if (err) { return next(); }
      else { return res.redirect("/Home") }
    })
  }
  else {
    return next();
  }
};

const CheckIfUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, Decode) => {
      if (err) {
        res.locals.User = null;
        next();
      } else {
        const loginUser = await HemayaUser.findById(Decode.ID);
        res.locals.User = loginUser;
        next();
      }
    });
  } else {
    res.locals.User = null;
    next();
  }
};

module.exports = { RequireAuth, UnRequireAuth, CheckIfUser, };