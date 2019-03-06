exports.myMiddleware = (req, res, next) => {
  req.name = "Danny";
  //res.cookie('name', 'Danny is a mage', {maxAge: 7777777});
  if(req.name === 'Danny'){
    throw Error('That is a bad name for person!');
  }
  next();
};

exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
}
