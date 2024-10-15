import jsonwebtoken from "jsonwebtoken"

export const createJWT = (res, userId) => {
  const token = jsonwebtoken.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "3d"
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "none",
    maxAge: 3 * 24 * 60 * 60 * 1000
  })
};