export const PaymentSuccessController = (req, res) => {
  res.render("Temp", {
    DrugName: req.app.locals.globalDrugName,
  });
};
