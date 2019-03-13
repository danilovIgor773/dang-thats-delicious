const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  res.render('index');
};


exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add store'});
};

exports.createStore = async (req, res) => {
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

exports.editStore = async (req, res) => {
  //1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id });
  //2. confirm the user is the owner of the store
  //3. Render out the edit form so the user can update their store
  res.render('editStore', {title: `Edit ${store.name}`, store: store});

};

exports.updateStore = async (req, res) => {
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
