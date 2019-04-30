var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "!subway12A",
  database: "bamazon"
});



  connection.connect(function(err) {
    if (err) throw err;
    overView();
  });

  function overView() {
    console.log("Selecting all products...");
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;


      // I used console.table to display the inventory in an easier to read format

      console.table(res);

      promtForItem(res);
    });
  }


function promtForItem(inventory) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "choice",
        message: "What is the ID of the product you would like to purchase? Or push 'X' to exit",
        validate: function(val) {
          return !isNaN(val) || val.toLowerCase() === "x";
        }
      }
    ])
    .then(function(val) {
      checkIfExit(val.choice);
      var choiceId = parseInt(val.choice);
      var product = checkInventory(choiceId, inventory);

      if (product) {
        promptQuantity(product);
      }
      else {
        console.log("That item is not in the inventory.");
        overView();
      }
    });
}

// Prompt the customer for quantity
function promptQuantity(product) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "quantity",
        message: "How many would you like to buy? Or push 'X' to exit",
        validate: function(val) {
          return val > 0 || val.toLowerCase() === "x";
        }
      }
    ])
    .then(function(val) {
      // Check if the user wants to exit
      checkIfExit(val.quantity);
      var quantity = parseInt(val.quantity);

      if (quantity > product.stock_quantity) {
        console.log("Not enough in stock");
        overView();
      }
      else {
        purchase(product, quantity);
      }
    });

}

// Purchase the item
function purchase(product, quantity) {
  connection.query(
    "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
    [quantity, product.item_id],
    function(err, res) {

      console.log("Purchased " + quantity + " " + product.product_name);
      overView();
    }
  );
}

function checkInventory(choiceId, inventory) {
  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i].item_id === choiceId) {
      return inventory[i];
    }
  }
  return null;
}

// Check to see if the user wants to exit
function checkIfExit(choice) {
  if (choice.toLowerCase() === "x") {
    console.log("Sorry to see you go");
    process.exit(0);
  }
}

  