import {Request, Response} from 'express'

import db from "../database/connections";
import convertHourToMinutes from "../utils/convertHourToMinutes";


export default class ClassesController {
  
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