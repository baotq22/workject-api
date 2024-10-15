import { validationResult } from "express-validator";

export const validators = {};

validators.validate = (validationArray) => async (req, res, next) => {
  await Promise.all(validationArray.map((validation) => validation.run(req)));

  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  const message = errors
    .array()
    .map((error) => error.msg)
    .join(" & ");

  return res.status(422).json({ message: "Validator error: " + message });
};
