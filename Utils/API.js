export const getLabel = (query) =>
  `https://api.fda.gov/drug/label.json?api_key=${process.env.KEY}&search=openfda.brand_name:${query}&limit=1`;
export const getNDC = (query) =>
  `https://api.fda.gov/drug/ndc.json?api_key=${process.env.KEY}&search=brand_name:${query}&limit=1`;
