import express from 'express';
import sql from 'mssql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const dbConfig = {
  user: "sa",
  password: "123456",
  server: "localhost",
  database: "WorkJect_DB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  }
};

const JWT_SECRET = "e636457cfb1e365488bcc82ec11aa797164569b261e4311cab8cfd1d9318520e"

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let pool = await sql.connect(dbConfig);

    let result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');

    const user = result.recordset[0];

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: "Service unavailable", error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { email, password, name, role } = req.body;

  // Validate that role is either 'Manager' or 'TeamMember'
  if (!['Manager', 'TeamMember'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user with hashed password and specified role
  let pool = await sql.connect(dbConfig);
  await pool.request()
    .input('email', sql.NVarChar, email)
    .input('name', sql.NVarChar, name)
    .input('password', sql.NVarChar, hashedPassword)
    .input('role', sql.NVarChar, role)
    .query('INSERT INTO users (email, name, password, role) VALUES (@email, @name, @password, @role)');

  res.json({ message: 'User registered successfully' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});