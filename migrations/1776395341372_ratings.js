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
  pgm.createTable("ratings", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    course_id: {
      type: "uuid",
      references: "courses",
      onDelete: "CASCADE",
      notNull: true,
    },
    user_id: { type: "uuid", references: "users", notNull: true },
    rating: { type: "NUMERIC(2,1)", notNull: true },
    description: { type: "text" },
  });
  pgm.addConstraint("ratings", "max_rating_value", {
    check: "rating <= 5.0",
  });
  pgm.createIndex("ratings", "course_id");
  pgm.createIndex("ratings", "user_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("ratings");
};
