export const DateFormat = () => {
  const d = new Date();
  // IST offset UTC +5:30
  let ISTTime = new Date(d.getTime() + (330 + d.getTimezoneOffset()) * 60000);
  return `${d.getDate()}/${
    d.getMonth() + 1
  }/${d.getFullYear()}, ${ISTTime.getHours()}:${ISTTime.getMinutes()}`;
};
