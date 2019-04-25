const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next){
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto){
      next(null, true);
    }else{
      next({ message: 'That filetype isn\'t allowed' }, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render('index');
};


exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add store'});
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  //check if there is no new file to resize
  if(!req.file){
    next(); //skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  //now resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  //once the photo is wwritten to our project fs keep going!
  next();
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully created ${store.name} Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // 1. Query the DB for a list of all stores
  const stores = await Store.find();
  //console.log(stores);
  res.render('stores', {title: 'Stores', stores: stores});
};

const confirmOwner = (store, user) => {
  if(!store.author.equals(user._id)){
    throw Error('You must own a store in order to edit it!');
  }
};

exports.editStore = async (req, res) => {
  //1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id });
  //2. confirm the user is the owner of the store
  confirmOwner(store, req.user);
  //3. Render out the edit form so the user can update their store
  res.render('editStore', {title: `Edit ${store.name}`, store: store});

};

exports.updateStore = async (req, res) => {
  // set the location data to be a Point
  req.body.location.type = 'Point';
  // find and update stores
  const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body,
    {
    new: true, // return the new store instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>.
      <a href="/stores/${store.slug}">View store -></a>`);
  //Redirect them the store and tell them it worked
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug }).
    populate('author');
  //res.json(store);
  if(!store) return next();
  res.render('store', { store, title: store.name });
};

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  //res.json(stores);
  //res.json(stores);
  res.render('tag', {tags, title: 'Tags', tag, stores})
};

exports.searchStores = async (req, res) => {
  const stores = await Store
  .find({
    $text: {
      $search: req.query.q
    }
  }, {
    score: {$meta: 'textScore'}
  })
  .sort({
    score: {$meta: 'textScore'}
  })
  .limit(5);
  res.json(stores);
};

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  //res.json(coordinates);
  const q = {
    location:{
      $near:{
        $geometry:{
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000 //10km
      }
    }
  };

  const stores = await Store.find(q).select('slug name description location photo').limit(10);

  res.json(stores);
};


exports.mapPage = (req, res) => {
  res.render('map', {title: 'Map'});
};


exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User
    .findByIdAndUpdate(req.user._id,
      { [operator]: {hearts: req.params.id }},
      { new: true }
    );
  res.json(user);
};

exports.getHearts = async (req, res) => {
  //res.json(req.user);
  const stores = await Store.find({
    _id: { $in: req.user.hearts }
  });
  //res.json(stores);
  res.render('stores', {title: 'Hearted Stores', stores});
};
