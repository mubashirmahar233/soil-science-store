const products = [
  {id:"fertility", code:"SS-01", name:"Soil Fertility Series", price:10, desc:"Comprehensive study material on soil fertility and nutrient management."},
  {id:"physics", code:"SS-02", name:"Soil Physics Series", price:10, desc:"Structured notes covering soil physical properties and water relations."},
  {id:"chemistry", code:"SS-03", name:"Soil Chemistry Series", price:10, desc:"Study resources for chemical properties, reactions and processes in soil."},
  {id:"microbiology", code:"SS-04", name:"Soil Microbiology Series", price:10, desc:"Notes covering soil microorganisms and their roles in soil systems."},
  {id:"conservation", code:"SS-05", name:"Soil Conservation Series", price:10, desc:"University-level notes on erosion, conservation and soil management."},
  {id:"mineralogy", code:"SS-06", name:"Soil Mineralogy Series", price:10, desc:"Organized material on soil minerals, classification and properties."},
  {id:"principles", code:"SS-07", name:"Principles of Soil Science", price:5, desc:"Foundational concepts for understanding soil science."},
  {id:"crop", code:"AG-01", name:"Crop Production Series", price:5, desc:"Study material covering major crop production concepts."},
  {id:"mcq", code:"EX-01", name:"MCQ Bank", price:5, desc:"Practice questions for revision and exam preparation."},
  {id:"complete", code:"PKG-01", name:"Complete Package", price:50, desc:"A convenient bundle containing the complete study collection.", badge:"BEST VALUE"}
];

let cart = JSON.parse(localStorage.getItem("soilScienceCart") || "[]");

const productGrid = document.getElementById("productGrid");
const cartPanel = document.getElementById("cart");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutModal = document.getElementById("checkoutModal");
const orderSummary = document.getElementById("orderSummary");

function money(value){ return `$${value.toFixed(2)}`; }

function saveCart(){
  localStorage.setItem("soilScienceCart", JSON.stringify(cart));
}

function renderProducts(){
  productGrid.innerHTML = products.map(p => `
    <article class="product-card">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
      <div class="product-code">${p.code}</div>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="product-bottom">
        <span class="price">${money(p.price)}</span>
        <button class="add-button" type="button" data-add="${p.id}">Add to Cart</button>
      </div>
    </article>
  `).join("");
}

function renderCart(){
  if(!cart.length){
    cartItems.innerHTML = `<div class="cart-empty">Your cart is currently empty.</div>`;
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div>
          <h4>${item.name}</h4>
          <p>${money(item.price)}</p>
        </div>
        <button class="remove-item" type="button" data-remove="${item.id}">Remove</button>
      </div>
    `).join("");
  }

  const total = cart.reduce((sum,item)=>sum + item.price,0);
  cartTotal.textContent = money(total);
  cartCount.textContent = cart.length;
  saveCart();
}

function openCart(){
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden","false");
  overlay.classList.add("active");
}
function closeCart(){
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden","true");
  overlay.classList.remove("active");
}

function openCheckout(){
  if(!cart.length){
    alert("Please add a study resource to your cart first.");
    return;
  }
  orderSummary.innerHTML = cart.map(item =>
    `<div class="summary-line"><span>${item.name}</span><strong>${money(item.price)}</strong></div>`
  ).join("") + `<div class="summary-line summary-total"><span>Total</span><strong>${cartTotal.textContent}</strong></div>`;
  checkoutModal.classList.add("open");
  checkoutModal.setAttribute("aria-hidden","false");
}
function closeCheckout(){
  checkoutModal.classList.remove("open");
  checkoutModal.setAttribute("aria-hidden","true");
}

productGrid.addEventListener("click",(e)=>{
  const button = e.target.closest("[data-add]");
  if(!button) return;
  const product = products.find(p=>p.id===button.dataset.add);
  if(product){
    cart.push({id:product.id,name:product.name,price:product.price});
    renderCart();
    openCart();
  }
});

cartItems.addEventListener("click",(e)=>{
  const button = e.target.closest("[data-remove]");
  if(!button) return;
  cart = cart.filter(item=>item.id !== button.dataset.remove);
  renderCart();
});

document.getElementById("cartButton").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);
document.getElementById("checkout").addEventListener("click",()=>{
  closeCart();
  openCheckout();
});
document.getElementById("closeModal").addEventListener("click",closeCheckout);

checkoutModal.addEventListener("click",(e)=>{
  if(e.target === checkoutModal) closeCheckout();
});

document.getElementById("checkoutForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  alert("Demo checkout: connect your approved payment provider here. No payment was taken.");
});

document.getElementById("year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
