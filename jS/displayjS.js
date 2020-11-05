var drugName = sessionStorage.getItem("drug");
document.getElementById("demo").innerHTML = drugName;



// api url 
const api_url = 
	"https://api.fda.gov/drug/ndc.json?api_key=S3DeKRRy8PtgRxfFGl5QbUlH0lxcAZ7QR2k8R9wH&search=generic_name:${drugName}&limit=1"; 

// Defining async function 
async function getapi(url) { 
	
	// Storing response 
	const response = await fetch(url); 
	
	// Storing data in form of JSON 
	var data = await response.json(); 
	console.log(data); 
	
} 
// Calling that async function 
getapi(api_url); 