import { Request, Response } from "express";

import db from "../database/connections";

export default class ConnectionsController {
  // GET /connections
  // Returns: total of connections reached at the moment
  async index(req: Request, res: Response) {
    const totals = await db("connections").count("* as total");
    const { total } = totals[0];

    res.json({ total });
  }

  // POST /connections
  // Params: user_id: User's id who has received a contact
  // Returns: 201 OK Created
  async create(req: Request, res: Response) {
    const { user_id } = req.body;

    await db("connections").insert({ user_id });

    res.status(201).send();
  }
}
