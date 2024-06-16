const frameOptions = (req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
};

export default frameOptions;
