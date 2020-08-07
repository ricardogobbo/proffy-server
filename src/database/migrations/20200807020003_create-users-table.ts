import Knex from "knex";

export async function up(knex: Knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("avatarUrl", 1024).notNullable();
    table.string("whatsapp").notNullable();
    table.string("bio", 2048).notNullable();
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable("users");
}
