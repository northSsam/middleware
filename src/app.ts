import express, { type Express, type Request, type Response } from 'express'
import pool from './db/index.ts'
import jwt from "jsonwebtoken"
import 'dotenv/config'

import { authMiddleware } from './middlewares/authMiddleware.ts'
import { adminMiddleware } from './middlewares/adminMiddleware.ts'

const app: Express = express()
const port = process.env.PORT || 3000

app.use(express.json())

// ini buat login
app.post("/api/login", async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      message: "Email & Password are required!"
    })
  }

  const [users]: any = await pool.execute(
    "select * from users where email = ?",
    [req.body.email]
  )

  if (!users.length) {
    return res.status(400).json({
      message: "Login failed!"
    })
  }

  if (users[0].password != req.body.password) {
    return res.status(400).json({
      message: "Login failed!"
    })
  }

  const token = jwt.sign(
    users[0],
    process.env.JWT_SECRET || "super-secret",
    { expiresIn: "1h" }
  )

  res.status(200).json({
    message: "Login success!",
    token: token
  })
})

// ini buat liat semua user, minimal login dulu
app.get(
  "/api/users",
  authMiddleware,
  async (req: Request, res: Response) => {
    const [users] = await pool.query("select * from users")
    res.status(200).json({
      message: "Users fetched!",
      data: users
    })
  }
)

// ini buat hapus user, harus admin
app.delete(
  "/api/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    await pool.execute(
      "delete from users where id = ?",
      [req.params.id]
    )
    res.status(200).json({
      message: "User deleted!"
    })
  }
)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})