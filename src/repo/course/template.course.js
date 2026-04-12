//   id: {
//       type: "uuid",
//       primaryKey: true,
//       default: pgm.func("gen_random_uuid()"),
//     },
//     title: { type: "text" },
//     slug: {
//       type: "text",
//       notNull: true,
//     },
//     description: { type: "text" },
//     thumbnail_rect: {
//       type: "uuid",
//       references: "images",
//     },
//     thumbnail_square: {
//       type: "uuid",
//       references: "images",
//     },
//     category: { type: "text" },
//     release_date: { type: "date" },
//     location_type: { type: "text" },
//     location_city: { type: "text" },
//     location_country: { type: "text" },
//     course_type: { type: "text" },
//     price: { type: "numeric(12,2)" },
//     offer_price: { type: "numeric(12,2)" },
//     offer_end_date: { type: "timestamp", default: pgm.func("now()") },
//     course_detail: { type: "json" },
//     published: { type: "boolean", default: false },
//     languages: { type: "string", default: "bangla" },
//     created_at: { type: "timestamp", default: pgm.func("now()") },

/**
 * What user will send
 *  {
 *  title
 *  price
 *  description
 *  languages
 *  category
 *  location_type
 *  course_detail 
 *  }
 */