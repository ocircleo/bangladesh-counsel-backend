/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createExtension("pgcrypto", { ifNotExists: true });
  pgm.createType("user_role", ["student", "instructor", "admin", "superadmin"]);
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    name: { type: "varchar(50)" },
    phone: { type: "varchar(15)", notNull: true, unique: true },
    email: { type: "varchar(254)", unique: true },
    password: { type: "text", notNull: true },
    role: { type: "user_role", default: "student" },
    date_of_birth: { type: "date" },
    created_at: { type: "date", default: pgm.func("now()") },
    blocked: { type: "boolean", default: false },
  });
  pgm.createIndex("users", "email");
  pgm.createIndex("users", "phone");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropType("user_role");
  pgm.dropTable("users");
  pgm.dropIndex("users", "email");
  pgm.dropIndex("users", "phone");
};
