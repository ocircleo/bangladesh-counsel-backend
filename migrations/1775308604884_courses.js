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
  pgm.createTable("courses", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    title: { type: "text" },
    slug: {
      type: "text",
      notNull: true,
    },
    description: { type: "text" },
    thumbnail_rect: {
      type: "uuid",
      references: "images",
    },
    thumbnail_square: {
      type: "uuid",
      references: "images",
    },
    category: { type: "text" },
    release_date: { type: "date" },
    location_type: { type: "text" },
    location_city: { type: "text" },
    location_country: { type: "text" },
    course_type: { type: "text" },
    price: { type: "numeric(12,2)" },
    offer_price: { type: "numeric(12,2)" },
    offer_end_date: { type: "timestamp", default: pgm.func("now()") },
    course_detail: { type: "json" },
    published: { type: "boolean", default: false },
    languages: { type: "string", default: "bangla" },
    created_at: { type: "timestamp", default: pgm.func("now()") },
  });
  pgm.createIndex("courses", "slug");
  pgm.createIndex("courses", "title");
  pgm.createIndex("courses", "category");
  pgm.createIndex("courses", "course_type");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("courses");
};
