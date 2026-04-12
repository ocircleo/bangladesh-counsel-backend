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
  pgm.createTable("images", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    slug: {
      type: "text",
      unique: true,
    },
    directory: {
      type: "text",
      notNull: true,
    },
    file_type: {
      type: "text",
    },
    estimated_size: {
      type: "numeric(10,2)",
    },
  });
  pgm.createIndex("images", "slug");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("images");
  pgm.dropIndex("images", "slug");
};
