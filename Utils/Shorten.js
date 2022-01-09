export const ShortenWord = (text, max) =>
  text && text.length > max
    ? text.slice(0, max).split(" ").slice(0, -1).join(" ")
    : text;
