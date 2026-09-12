export const t = (template, vars = {}) => {
  if (template == null) return '';
  return Object.entries(vars).reduce(
    (str, [key, value]) => str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value ?? '')) ,
    String(template),
  );
};