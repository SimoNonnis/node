const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'PLease enter a store name!',
  },
  slug: String,
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
});

storeSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next(); //Skip
    return; // we could write return next() as well
  }
  this.slug = slug(this.name);
  next();
  // TODO make unique slugs
})

module.exports = mongoose.model('Store', storeSchema);
