const PassportLocalStrategy = require('passport-local').Strategy

module.exports = new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, (req, email, password, done) => {
  const user = {
    email: email.trim(),
    password: password.trim(),
    name: req.body.username.trim(),
    firstName: req.body.firstName.trim(),
    lastName: req.body.lastName.trim()
  }

  const existingUser = usersData.findByEmail(email)
  if (existingUser) {
    return done('E-mail already exists!')
  }

  usersData.save(user)

  return done(null)
})
