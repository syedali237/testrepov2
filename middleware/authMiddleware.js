import jwt from 'jsonwebtoken';

const authenticateUser = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  // console.log("inside authMiddleware");
  // console.log(req.cookies);
  // console.log(req.headers);
  // console.log("Token in middleware:", token);


  if (!token) {
    res.status(401).send("Access denied. No token provided.");
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = (decoded)._id;
    next();
  } catch (error) {
    res.status(400).send("Invalid token.");
    return
  }
};

export default authenticateUser;
