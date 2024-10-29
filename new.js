$(document).ready(function () {
    $.ajax({
        url: "data.json",
        type: "get",
        success: function (brands) {
            let apple = "";
            $.each(brands, function (keys, arrays) {
                $.each(arrays, function (index, objects) {
                    apple += `<div class="col-lg-3 mt-3">
                                <div class="card">
                                    <img class="card-img-top" src="${objects.image}" alt="Title" />
                                    <div class="card-body">
                                        <h4 class="card-title">${objects.name}</h4>
                                        <p class="card-text">$: ${objects.price}</p>
                                        <a href="product.html?product=${keys + index}" class="btn btn-info">View Details</a>
                                    </div>
                                </div>
                            </div>`;
                });
            });
            $("#carddata").html(apple);
        }
    });
});

// Detail Page
let url = window.location.href;
let getUrl = new URL(url);
let getQueryString = getUrl.searchParams.get("product");

$.ajax({
    url: "data.json",
    type: "get",
    success: function (detailProducts) {
        $.each(detailProducts, function (detKey, detArray) {
            $.each(detArray, function (detIndex, detobjects) {
                let concatVal = detKey + detIndex;
                if (concatVal == getQueryString) {
                    $("#detailImage").html(`<img class="card-img-top" src="${detobjects.image}" alt="Title" />`);
                    $("#detailDes").html(`<div class="card-body">
                        <h4 class="card-title">${detobjects.name}</h4>
                        <p class="card-text">$: ${detobjects.price}</p>
                        <p class="card-text">${detobjects.description}</p>
                        <button type="button" class="btn btn-outline-danger" onclick="Decrement()">-</button>
                        <input type="number" id="number" value="1" />
                        <button type="button" class="btn btn-outline-success" onclick="Increment()">+</button>
                    </div>
                    <button type="button" class="mt-3 btn btn-outline-primary" onclick="AddToCart('${getQueryString}')">
                        Add To Cart
                    </button>`);
                }
            });
        });
    }
});

// Quantity Control
let count = 1;
function Increment() {
    count++;
    document.querySelector("#number").value = count;
}
function Decrement() {
    if (count > 1) {
        count--;
    }
    document.querySelector("#number").value = count;
}

// Add to Cart
function AddToCart(id) {
    let quantity = $("#number").val();
    $.ajax({
        url: "data.json",
        type: "get",
        success: function (cartProducts) {
            $.each(cartProducts, function (cartKeys, cartArrays) {
                $.each(cartArrays, function (cartIndex, cartObject) {
                    if (cartKeys + cartIndex == id) {
                        let localData = JSON.parse(localStorage.getItem("cartData")) || [];
                        let obj = {
                            productId: id,
                            productName: cartObject.name,
                            productPrice: cartObject.price,
                            productImage: cartObject.image,
                            productQuantity: quantity
                        };
                        localData.push(obj);
                        localStorage.setItem("cartData", JSON.stringify(localData));
                        alert(`${cartObject.name} added to cart!`);
                        location.assign("index.html");
                    }
                });
            });
        }
    });
}

// Cart Count

let cartData = JSON.parse(localStorage.getItem("cartData")) || [];
$("#cartCount").html(cartData.length);

// View Cart

let cartItemsHtml = "";
let grandTotal = 0;
let modalsHtml = "";

cartData.forEach(item => {

    // Convert productPrice to a float
    let itemPrice = parseFloat(item.productPrice);
    let itemTotal = item.productQuantity * itemPrice;
    grandTotal += itemTotal;

    cartItemsHtml += `<tr>
                        <td><img src="${item.productImage}" class="img-fluid rounded-top" /></td>
                        <td>${item.productName}</td>
                        <td>${item.productQuantity}</td>
                        <td>$${itemPrice.toFixed(2)}</td>
                        <td>$${itemTotal.toFixed(2)}</td>
                        <td><button class="btn btn-info" data-bs-toggle="modal" data-bs-target="#modal${item.productId}">Edit</button></td>
                        <td><button class="btn btn-danger" onclick="CartDelete('${item.productId}')">Delete</button></td>
                    </tr>`;

    modalsHtml += `<div class="modal fade" id="modal${item.productId}" tabindex="-1" role="dialog">
                      <div class="modal-dialog modal-dialog-centered">
                          <div class="modal-content">
                              <div class="modal-header">
                                  <h5 class="modal-title">${item.productName}</h5>
                                  <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                              </div>
                              <div class="modal-body">
                                  <div class="row justify-content-center">
                                      <div class="col-lg-3">
                                          <img src="${item.productImage}" class="img-fluid rounded-top" />
                                      </div>
                                      <div class="col-lg-9">
                                          <div class="card-body">
                                              <h4 class="card-title">${item.productName}</h4>
                                              <p class="card-text">Price: $${itemPrice.toFixed(2)}</p>
                                              <button class="btn btn-outline-danger" onclick="ModalDecrement('${item.productId}')">-</button>
                                              <input type="number" id="number${item.productId}" value="${item.productQuantity}" />
                                              <button class="btn btn-outline-success" onclick="ModalIncrement('${item.productId}')">+</button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              <div class="modal-footer">
                                  <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                  <button class="btn btn-primary" onclick="cartUpdate('${item.productId}')">Save changes</button>
                              </div>
                          </div>
                      </div>
                  </div>`;
});

$("#dataTable").html(cartItemsHtml);
$("#mod").html(modalsHtml);
$("#grandTotal").text(" $" + grandTotal.toFixed(2));

// Cart Delete
function CartDelete(id) {
    cartData = cartData.filter(item => item.productId !== id);
    alert("Product deleted from cart");
    localStorage.setItem("cartData", JSON.stringify(cartData));
    location.assign("cart.html");
}

// Update Cart Quantity in Modal
function cartUpdate(id) {
    let newQuantity = parseInt(document.querySelector("#number" + id).value);
    cartData.forEach(item => {
        if (item.productId === id) {
            item.productQuantity = newQuantity;
        }
    });
    localStorage.setItem("cartData", JSON.stringify(cartData));
    alert("Cart updated");
    location.assign("cart.html");
}

// Modal Increment/Decrement
function ModalIncrement(id) {
    let quantityField = document.querySelector("#number" + id);
    quantityField.value = parseInt(quantityField.value) + 1;
}
function ModalDecrement(id) {
    let quantityField = document.querySelector("#number" + id);
    if (parseInt(quantityField.value) > 1) {
        quantityField.value = parseInt(quantityField.value) - 1;
    }
}

