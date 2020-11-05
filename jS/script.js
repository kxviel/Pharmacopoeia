//form variable
function myFunction() {
  var x = document.getElementById("myForm");
  var a = x[0].value;
  sessionStorage.setItem("drug", a);
}
