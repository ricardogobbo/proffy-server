import { Request, Response } from "express";

import db from "../database/connections";
import convertHourToMinutes from "../utils/convertHourToMinutes";

export default class ClassesController {
  // GET /classes
  // Params:
  //    query.subject: Subject to be filtered
  //    query.week_day: Day of Week to be filtered
  //    query.time: Time in format HH:MM to be filtered
  // Returns:
  //    200: A list of teachers filtered by query params
  //    400: Bad Request. All filter options must have been filled.
  async index(req: Request, res: Response) {
    const filters = req.query;

    // Filter options
    const subject = filters.subject as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;
    const timeInMinutes = convertHourToMinutes(time);

    // If any filter option wasn't provided, returns 400 = Bad Request
    if (!subject || !week_day || !time) {
      return res.status(400).send({
        error: true,
        message: "You need to specify all filter options",
      });
    }

    // SQL query to get all users and classes that match with filter options
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

    // Returns 200
    res.json(result);
  }

  // POST /classes
  // Transactional creation of user, class and schedule
  // Params:
  //    body.
  //    body.name: User's name
  //    body.avatarUrl: User's avatar image url
  //    body.bio: User's biography
  //    body.pricePerHour: User's price per hour
  //    body.whatsapp: User's WhatsApp number
  //    body.subject: User's subject
  //    body.schedule: User's schedule array with week_day, initial and ending time
  // Returns: 
  //    201: Created
  //    400: Bad Request
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

    // Begin Transaction
    const transaction = await db.transaction();

    try {
      // Save user information 
      const resultUserCreation = await transaction
        .insert({ name, avatarUrl, bio, whatsapp })
        .into("users");

      // Retrieve user id from the first row of result
      const user_id = resultUserCreation[0];

      // Save class information
      const resultClassCreation = await transaction
        .insert({
          user_id,
          subject,
          pricePerHour,
        })
        .into("classes");

      const class_id = resultClassCreation[0];

      // An interface to map schedule items
      // TODO move this interface to a properly place
      interface ScheduleItem {
        week_day: number;
        from: string;
        to: string;
      }

      // Add class id to schedule item and convert from/to to minutes from midnight 
      const schedulesToBeSaved = schedule.map((scheduleItem: ScheduleItem) => {
        return {
          class_id,
          week_day: scheduleItem.week_day,
          from: convertHourToMinutes(scheduleItem.from),
          to: convertHourToMinutes(scheduleItem.to),
        };
      });

      // Add all schedule items
      await transaction.insert(schedulesToBeSaved).into("class_schedules");

      // Commit transaction
      await transaction.commit();

      // 201 Created
      res.status(201).send();
    } catch (err) {
      // Rollback Transaction
      await transaction.rollback();

      // Dispatch an 400 Bad Request error
      // TODO send better error message
      res.status(400).send({
        error: "An error has occurred while creating new class.",
        exception: err,
      });
    }
  }
}
