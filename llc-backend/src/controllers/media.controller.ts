import { Request, Response } from "express";

// TODO: update with actual file upload
export async function createMediaTypeController(req: Request, res: Response) {
  const filePath = req.file
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : null;

  return res.status(201).json({
    filePath,
  });
}
