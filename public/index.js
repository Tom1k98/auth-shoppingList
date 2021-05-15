const SERVER = `https://tomdev-shoppinglist.herokuapp.com`;

const ulElem = document.getElementById("shoppingList");
const delBtn = document.querySelector(".delBtn");

// return all items, that should be deleted
const getAllChecked = () => {
  let toDelete = [];
  let checked = document
    .querySelectorAll("input[type=checkbox]:checked")
    .forEach((chckbox) => {
      toDelete.push({ id: chckbox.id, name: chckbox.name });
    });
  return toDelete;
};

// create checkbox for item
const createCheckbox = (id, name, liElem) => {
  let checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.name = name;
  checkbox.id = id;
  checkbox.classList.add("checkbox");
  checkbox.addEventListener("click", () => {
    if (liElem.style.textDecoration == "line-through") {
      liElem.style.textDecoration = "none";
    } else {
      liElem.style.textDecoration = "line-through";
    }
  });
  return checkbox;
};

// calculate price
const calculatePrice = () => {
  let totalPrice = 0;
  fetch(`${SERVER}/api/shopping`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      data.data.forEach((item) => {
        totalPrice += item.price * item.quantity;
      });
      console.log(totalPrice);
      document.querySelector(".getPrice").innerHTML = totalPrice;
    });
};

// get items
const getData = () => {
  fetch(`${SERVER}/api/shopping`)
    .then((res) => res.json())
    .then((items) => {
      items.data.map((item) => {
        let li = document.createElement("li");
        // li.classList.add("item")
        li.innerHTML = `${item.quantity}x ${item.item}`;
        li.appendChild(createCheckbox(item._id, item.item, li));
        ulElem.appendChild(li);
        calculatePrice();
      });
    })
    .catch((err) => {
      console.log({ err: err, msg: "error1 something went wrong" });
    });
};

// set item
document.querySelector(".btn").addEventListener("click", () => {
  let itemValue = document.getElementById("addToList").value;
  let quantityValue = document.getElementById("quantity").value;
  let priceValue = document.getElementById("price").value;

  fetch(`${SERVER}/api/shopping`, {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      item: itemValue,
      quantity: quantityValue,
      price: priceValue,
    }),
  })
    .then((res) => res.json())
    .then((back) => {
      location.reload();
    })
    .catch((err) => console.log(err));
});

// function to send delete request by id
const deleteItem = (id) => {
  fetch(`${SERVER}/api/shopping`, {
    method: "delete",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
    }),
  })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.log(err));
};

// delete items
delBtn.addEventListener("click", () => {
  let allChecked = getAllChecked();
  if (allChecked.length > 0) {
    allChecked.map((del) => {
      deleteItem(del.id);
      allChecked = allChecked.filter((value) => value["id"] != del.id);
      if (allChecked.length === 0) {
        setTimeout(() => location.reload(), 1000);
      }
    });
  } else {
    let msgbox = document.querySelector(".upozorneni");
    let ne = document.getElementById("ne");
    let ano = document.getElementById("ano");
    msgbox.classList.add("active");

    ano.addEventListener("click", () => {
      let allItems = [...document.querySelectorAll("input[type=checkbox]")];
      allItems.map((oneItem) => {
        deleteItem(oneItem.id);
        console.log(allItems.length);
        allItems = allItems.filter((value) => value.id !== oneItem.id);
        if (allItems.length === 0) {
          setTimeout(() => location.reload(), 1000);
        }
        msgbox.classList.remove("active");
      });
    });
    ne.addEventListener("click", () => {
      msgbox.classList.remove("active");
    });
  }
});

// update item TODO
const updateItem = (id) => {
  fetch(`${SERVER}/api/shopping/update`);
};

// document
//   .getElementById("btnCalculate")
//   .addEventListener("click", calculatePrice);

getData();
