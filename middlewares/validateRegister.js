import validator from "validator";

const validateRegisterInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!validator.isEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter a valid email" });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters",
    });
  }

  next();
};

export default validateRegisterInput;
