import { Request, Response } from "express";

import db from "../database/connections";
import convertHourToMinutes from "../utils/convertHourToMinutes";

export default class ClassesController {
  async index(req: Request, res: Response) {
    const filters = req.query;
    console.log(filters);

    const subject = filters.subject as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;
    const timeInMinutes = convertHourToMinutes(time);

    if (!subject || !week_day || !time) {
      return res
        .status(400)
        .send({ error: true, message: "You need to specify all" });
    }

    let result = await db("classes")
      .innerJoin("users", "classes.user_id", "=", "users.id")
      .innerJoin(
        "class_schedules",
        "class_schedules.class_id",
        "=",
        "classes.id"
      )
      .andWhere("classes.subject", "=", subject)
      .andWhere("class_schedules.week_day", "=", week_day)
      .andWhere("class_schedules.from", "<=", timeInMinutes)
      .andWhere("class_schedules.to", ">", timeInMinutes)
      .select(["classes.*", "users.*"]);

    res.json(result);
  }

  async create(req: Request, res: Response) {
    const {
      name,
      avatarUrl,
      bio,
      pricePerHour,
      whatsapp,
      subject,
      schedule,
    } = req.body;

    const transaction = await db.transaction();

    try {
      const resultUserCreation = await transaction
        .insert({ name, avatarUrl, bio, whatsapp })
        .into("users");

      const user_id = resultUserCreation[0];

      const resultClassCreation = await transaction
        .insert({
          user_id,
          subject,
          pricePerHour,
        })
        .into("classes");

      const class_id = resultClassCreation[0];

      interface ScheduleItem {
        week_day: number;
        from: string;
        to: string;
      }

      const schedulesToBeSaved = schedule.map((scheduleItem: ScheduleItem) => {
        return {
          class_id,
          week_day: scheduleItem.week_day,
          from: convertHourToMinutes(scheduleItem.from),
          to: convertHourToMinutes(scheduleItem.to),
        };
      });

      await transaction.insert(schedulesToBeSaved).into("class_schedules");

      await transaction.commit();

      res.status(201).send();
    } catch (err) {
      await transaction.rollback();

      res.status(400).send({
        error: "An error has occuried while creating new class.",
        exception: err,
      });
    }
  }
}
