const mongoose = require('mongoose');
const User = mongoose.model('User');
const passport = require('passport');
const crypto = require('crypto');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return
  }

  req.flash('error', 'Ooops you must be logged in to add a store!');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // 1. Check if user exists with that email
  const user = await User.findOne({ email: req.body.email});

  if (!user) {
    req.flash('error', 'Something is wrong!');
    res.redirect('/login');
  }

  // 2. Set reset tokens and expiry in their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000 // 1 hour from now

  await user.save();

  // 3. Send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  req.flash('success', `You have been emailed a password reset link. ${resetURL}`);

  // 4. Redirect to login after token used
  res.redirect('/login');
}
