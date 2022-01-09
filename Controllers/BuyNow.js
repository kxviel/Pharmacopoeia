export const BuyNowController = (req, res) => {
  let myPrice = Math.floor(100 + Math.random() * 900);
  req.app.locals.globalPrice = myPrice;
  res.render("BuyNow", {
    Price: `₹${myPrice}`,
    DrugName: req.app.locals.globalDrugName,
  });
};
