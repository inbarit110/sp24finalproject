// Function to display results
const displayResults = (result) => {
  const divElement = document.getElementById("output");
  // Reset output for each call
  divElement.innerHTML = "";

  if (result.trans === "Error") {
      // Create h2 and paragraph elements and add to div
      const h2Elem = document.createElement("h2");
      h2Elem.innerText = "Application Error";
      const paraElement = document.createElement("p");
      paraElement.innerText = result.error;
      // Add elements
      divElement.appendChild(h2Elem);
      divElement.appendChild(paraElement);
  } else {
      if (result.rows.length === 0) {
        // Create h3 and add to div
        const h3Elem = document.createElement("h3");
        h3Elem.innerText = "No Records found!";
        divElement.appendChild(h3Elem);
      } else {
          // Create a table element and table header row
          const tblElement = document.createElement("table");
          const theadElement = document.createElement("thead");
          const thRowElement = document.createElement("tr");
          const thIdElement = document.createElement("td");
          thIdElement.innerText = "ID";
          const thFnameElement = document.createElement("td");
          thFnameElement.innerText = "Fname";
          const thLnameElement = document.createElement("td");
          thLnameElement.innerText = "Lname";
          const thStateElement = document.createElement("td");
          thStateElement.innerText = "State";
          const thSalesPrevElement = document.createElement("td");
          thSalesPrevElement.innerText = "SalesPrev";
          const thSalesYTDElement = document.createElement("td");
          thSalesYTDElement.innerText = "SalesYTD";
          // Add elements
          thRowElement.appendChild(thIdElement);
          thRowElement.appendChild(thFnameElement);
          thRowElement.appendChild(thLnameElement);
          thRowElement.appendChild(thStateElement);
          thRowElement.appendChild(thSalesPrevElement);
          thRowElement.appendChild(thSalesYTDElement);
          //
          theadElement.appendChild(thRowElement);
          //
          tblElement.appendChild(theadElement);

          // Loop
          result.rows.forEach(customer => { 
            // Create table rows
            const trElement = document.createElement("tr");
            const tdIdElement = document.createElement("td");
            tdIdElement.innerText = customer.cusId;
            const tdFnameElement = document.createElement("td");
            tdFnameElement.innerText = customer.cusFname
            const tdLnameElement = document.createElement("td");
            tdLnameElement.innerText = customer.cusLname
            const tdStateElement = document.createElement("td");
            tdStateElement.innerText = customer.cusState;
            const tdSalesPrevElement = document.createElement("td");
            tdSalesPrevElement.innerText = customer.cusSalesPrev;
            const tdSalesYTDElement = document.createElement("td");
            tdSalesYTDElement.innerText = customer.cusSalesYTD;
            // Add elements
            trElement.appendChild(tdIdElement);
            trElement.appendChild(thFnameElement);
            trElement.appendChild(thLnameElement);
            trElement.appendChild(thStateElement);
            trElement.appendChild(thSalesPrevElement);
            trElement.appendChild(thSalesYTDElement);
            //
            tblElement.appendChild(trElement);
          });
          // Add table to div
          divElement.appendChild(tblElement);
       };
  };
};

// Handle form submission
document.querySelector("form").addEventListener("submit", e => {
  // Cancel default behavior of sending a synchronous POST request
  e.preventDefault();
  // Create a FormData object, passing the form as a parameter
  const formData = new FormData(e.target);
  fetch("/searchajax", {
      method: "POST",
      body: formData
  })
      .then(response => response.json())
      .then(result => {
          displayResults(result);
      })
      .catch(err => {
          console.error(err.message);
      });
});