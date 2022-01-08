export const BuyController = (req, res) => {
  let myPrice = Math.floor(100 + Math.random() * 900);
  app.set("myPrice", myPrice);
  res.render("BuyNow", {
    Price: `₹${myPrice}`,
    DrugName: req.app.get("globalDrugName"),
  });
};
