export const BuyController = (req, res) => {
  let phoneNo = req.body.phone;
  let fullName = req.body.fullname;
  let paymentMethod = req.body.method;
  let address = req.body.subject;
  let pincode = req.body.pin;
  let currPrice = req.app.locals.globalPrice;
  let sql =
    "INSERT INTO `BUYMEDS`(username, PhoneNo, PaymentMethod,Address,FullName,Pincode,Price) VALUES('" +
    req.app.get("usernameL") +
    "','" +
    phoneNo +
    "','" +
    paymentMethod +
    "','" +
    address +
    "','" +
    fullName +
    "','" +
    pincode +
    "','" +
    currPrice +
    "');";
  con.query(sql, (err) => {
    if (err) throw err;
  });
  let selSQL = "SELECT Price, PhoneNo, FullName FROM BUYMEDS";
  con.query(selSQL, (err, result) => {
    if (err) throw err;
    if (result !== 0) {
      res.render("Temp", {
        DrugName: req.app.get("globalDrugName"),
        Price: `₹${result[0]["Price"]}`,
        Phone: result[0]["PhoneNo"],
        Name: result[0]["FullName"],
      });
    }
  });
};
