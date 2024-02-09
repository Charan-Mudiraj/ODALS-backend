const Router = require("express").Router();
const User = require("../schemas/user");
const multer = require("multer");
const path = require("path");
const j = require("joi");
const fs = require("fs");

const validateStringWithNoSpaces = (value, helpers) => {
  if (typeof value !== "string" || /\s/.test(value)) {
    return helpers.error("string.noSpaces", { v: value });
  }
  return value;
};
const signupSchema = j.object({
  name: j.string().required(),
  password: j
    .string()
    .min(6)
    .custom(validateStringWithNoSpaces)
    .messages({
      "string.noSpaces": "no spaces allowed for {#label}",
    })
    .required(),
  number: j
    .string()
    .min(10)
    .max(10)
    .custom(validateStringWithNoSpaces)
    .messages({
      "string.noSpaces": "no spaces allowed for {#label}",
    })
    .required(),
  email: j.string().email().required(),
  address: j.string().required(),
});
const signinSchema = j.object({
  email: j.string().email().required(),
  password: j
    .string()
    .min(6)
    .custom(validateStringWithNoSpaces)
    .messages({
      "string.noSpaces": "no spaces allowed for {#label}",
    })
    .required(),
});
const detailsUpdateSchema = j.object({
  name: j.string().required(),
  password: j
    .string()
    .min(6)
    .custom(validateStringWithNoSpaces)
    .messages({
      "string.noSpaces": "no spaces allowed for {#label}",
    })
    .required(),
  number: j
    .string()
    .min(10)
    .max(10)
    .custom(validateStringWithNoSpaces)
    .messages({
      "string.noSpaces": "no spaces allowed for {#label}",
    })
    .required(),
  address: j.string().required(),
  isExamTaken: j.boolean().optional(),
  examPercentage: j.number().optional(),
  doi: j.string().optional(),
  validity: j.string().optional(),
});
Router.post("/signin", async (req, res) => {
  const result = signinSchema.validate(req.body.data);
  if (result.error) {
    res.json({ status: "fail", message: result.error.message });
    return;
  }
  const user = await User.findOne({ email: req.body.data.email }).exec();
  if (!user) {
    res.json({
      status: "fail",
      message: "User Doesn't Exists",
    });
    return;
  }

  if (user.password != req.body.data.password) {
    res.json({ status: "fail", message: "User Password is Incorrect" });
    return;
  }
  console.log("A user SignedIn with ID: " + user._id);
  res.json({
    status: "ok",
    message: "User SignedIn with ID: " + user._id,
    userID: user._id,
  });
});

Router.post("/signup", async (req, res) => {
  const result = signupSchema.validate(req.body.data);
  if (result.error) {
    res.json({ status: "fail", message: result.error.message });
    return;
  }
  const user = await User.findOne({ email: req.body.data.email }).exec();
  if (user) {
    res.json({
      status: "fail",
      message: "User Already Exists with ID: " + user._id,
    });
    return;
  }
  const newUser = new User(req.body.data);
  const savedUser = await newUser.save();
  console.log("New user saved with UserID: " + savedUser._id);
  res.json({ status: "ok", message: "User added with ID: " + savedUser._id });
});

Router.get("/details", async (req, res) => {
  const user = await User.findById(req.query.userID).exec();
  res.json(user);
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// after the req goes to upload middleware, the req object is cleared...so cannot get data directly by req.
// from upload middleware, the only usefull thing we get is req.file.
Router.post("/avatar", upload.single("avatar"), async (req, res) => {
  let userID;
  if (req.query) {
    userID = req.query.userID;
  }
  if (userID) {
    const imgPath = "uploads/" + req.file.filename;
    await User.findByIdAndUpdate(userID, { $set: { avatar: imgPath } });
    res.json({
      status: "ok",
      message: "User Avatar has Successfully Uploaded",
    });
  }
});
Router.get("/avatar", async (req, res) => {
  const userID = req.query.userID;
  const user = await User.findById(userID);
  if (user) {
    const imgPath = user.avatar;
    const absolutePath = path.join(__dirname + "/../" + imgPath);
    const defaultImagePath = path.join(
      __dirname + "/../uploads/unknown-profile.png"
    );
    fs.access(absolutePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.sendFile(defaultImagePath);
      } else {
        res.sendFile(absolutePath);
      }
    });
  } else {
    res.json({ status: "fail", message: "Fetch Error" });
  }
});

Router.post("/details", async (req, res) => {
  const result = detailsUpdateSchema.validate(req.body);
  if (result.error) {
    res.json({ status: "fail", message: result.error.message });
    return;
  }
  const userID = req.query.userID;
  await User.findByIdAndUpdate(userID, { $set: req.body });
  res.json({ status: "ok", message: "User Details has Updated Successfully" });
});
module.exports = Router;
