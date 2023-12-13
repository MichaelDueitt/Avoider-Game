// game.js

let gameActive = false;

function startGame() {
  if (!gameActive) {
    // Include your game start logic here
    console.log("Game started!");
    gameActive = true;
  }
}

function toggleItemShop() {
  var itemShop = document.getElementById("itemShop");
  if (itemShop.style.display === "none") {
    itemShop.style.display = "block";
  } else {
    itemShop.style.display = "none";
  }
}

// Include the item shop functionality from item_shop.js here
// Initialize variables
let playerInventory = [];
let totalGold = 0;
let totalScore = 0;

function buyItem(itemName, itemPrice) {
  if (totalGold >= itemPrice) {
    // Deduct gold, add item to inventory, and update totals
    totalGold -= itemPrice;
    playerInventory.push(itemName);
    totalScore += 10; // For example, add 10 to the score for each item bought

    // Update HTML elements
    updateInventory();
    updateTotals();
  } else {
    alert("Not enough gold to buy this item!");
  }
}

function updateInventory() {
  const inventoryList = document.getElementById("playerInventory");

  // Clear the current inventory list
  inventoryList.innerHTML = "";

  // Add each item to the list
  playerInventory.forEach(item => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    inventoryList.appendChild(listItem);
  });
}

function updateTotals() {
  document.getElementById("totalGold").textContent = totalGold;
  document.getElementById("totalScore").textContent = totalScore;
}
