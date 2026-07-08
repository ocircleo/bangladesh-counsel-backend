function generateTimeRandomId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

  const random = (length) =>
    Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");

  const time = Date.now().toString(36); // shorter than decimal

  return `${random(2)}${time}${random(4)}`;
}

function slugGenerator(input, suffixLength = 6) {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove special characters
      .replace(/\s+/g, "-") // replace spaces with hyphen
      .replace(/-+/g, "-") + // remove duplicate hyphens
    "-" +
    generateTimeRandomId()
  );
}
module.exports = { slugGenerator };
