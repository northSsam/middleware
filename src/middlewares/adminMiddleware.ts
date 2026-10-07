import type { NextFunction, Response } from "express"

export function adminMiddleware(req: any, res: Response, next: NextFunction)
 {

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Akses hanya untuk admin!"
    })
  }

  next()
}