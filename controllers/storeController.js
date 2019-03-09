// exports.myMiddleware = (req, res, next) => {
//   req.name = "Danny";
//   //res.cookie('name', 'Danny is a mage', {maxAge: 7777777});
//   if(req.name === 'Danny'){
//     throw Error('That is a bad name for person!');
//   }
//   next();
// };

exports.homePage = (req, res) => {
  res.render('index');
};


exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add store'});
};

exports.createStore = (req, res) => {
  res.json(req.body);
};
