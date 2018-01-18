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
  created: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!',
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  photo: {
    type: String,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author',
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

storeSchema.index({
  name: 'text',
  description: 'text',
});

storeSchema.index({
  location: '2dsphere',
});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); //Skip
    return; // we could write return next() as well
  }

  this.slug = slug(this.name);
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });

  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }

  next();
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // Find stores and populate their reviews
    { $lookup: {
      from: 'reviews',
      localField: '_id',
      foreignField: 'store',
      as: 'reviews'
    }},
    // Filter for items that have 2 or more reviews
    { $match: {
      'reviews.1': { $exists: true }
    }},
    // Add average reviews field
    { $addFields: {
      averageRating: { $avg: '$reviews.rating' }
    }},
    // Sort it by new field, highest reviews first
    { $sort: {
      averageRating: -1
    }},
    // Limit to at most 10
    { $limit: 10 }
  ]);
}

// Find reviews where stores _id property === reviews store property
storeSchema.virtual('reviews', {
  ref: 'Review', // What model to link
  localField: '_id', // which field on the store
  foreignField: 'store', // which field on the review
})

module.exports = mongoose.model('Store', storeSchema);
