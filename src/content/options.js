export default function processOptions({ json, prettier: prettierOptions }) {
  let options = {};

  if (json.enable) {
    try {
      options = JSON.parse(json.config);
    } catch {
      options = {};
    }
  } else {
    options = { ...prettierOptions };
  }

  return options;
}