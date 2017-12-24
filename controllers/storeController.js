const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That file type isn\'t allowed!'}, false);
    }
  }
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store'});
};

exports.upload = multer(multerOptions).single('photo');
exports.resize = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  } else {
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    // Now resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);

    next();
  }
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();

  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();

  res.render('stores', { title: 'Stores', stores });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it!');
  }
};

exports.editStore = async (req, res) => {
  // 1. Query DB for stores given the id
  const store = await Store.findOne({ _id: req.params.id });
  // 2. Confirm they are the owners of the stores
  confirmOwner(store, req.user);
  // 3. Render an edit form so the user can update
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // Set the location data to be a point
  req.body.location.type = 'Point';
  // 1. Find and update the store
  const store = await Store.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true, runValidators: true }
  ).exec();

  // 2. Rediret to store and flash msg
  req.flash(
    'success',
    `Successfully updated ${store.name}. <a href="/stores/${store.slug}">View Store</a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next  ) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('author');
  if (!store) return next();

  res.render('store', { title: store.name, store });
}

exports.getStoreByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storePromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storePromise]);

  res.render('tag', { tags, stores, title: 'Tags', tag });
}
