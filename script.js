const products=[
{id:"fertility",name:"Soil Fertility Series",icon:"🌱",price:10,desc:"Comprehensive study material on soil fertility and nutrient management."},
{id:"physics",name:"Soil Physics Series",icon:"💧",price:10,desc:"Structured notes covering soil physical properties and water relations."},
{id:"chemistry",name:"Soil Chemistry Series",icon:"🧪",price:10,desc:"Study resources for chemical properties, reactions and processes in soil."},
{id:"microbiology",name:"Soil Microbiology Series",icon:"🦠",price:10,desc:"Notes covering soil microorganisms and their roles in soil systems."},
{id:"conservation",name:"Soil Conservation Series",icon:"🌍",price:10,desc:"University-level notes on soil erosion, conservation and management."},
{id:"mineralogy",name:"Soil Mineralogy Series",icon:"🪨",price:10,desc:"Organized material on soil minerals, classification and properties."},
{id:"principles",name:"Principles of Soil Science",icon:"📚",price:5,desc:"Foundational concepts for understanding soil science."},
{id:"crop",name:"Crop Production Series",icon:"🌾",price:5,desc:"Study material covering major crop production concepts."},
{id:"mcq",name:"MCQ Bank",icon:"📝",price:5,desc:"Practice questions for revision and exam preparation."},
{id:"complete",name:"Complete Package",icon:"📦",price:50,desc:"A convenient bundle containing the complete study collection.",badge:"BEST VALUE"}
];
let cart=[];
const $=s=>document.querySelector(s);
function money(n){return `$${n.toFixed(2)}`}
function renderProducts(){
 $("#productGrid").innerHTML=products.map(p=>`<article class="product">
  <div class="product-icon">${p.icon}</div>${p.badge?`<span class="badge">${p.badge}</span>`:""}
  <h3>${p.name}</h3><p>${p.desc}</p><div class="price">${money(p.price)}</div>
  <button class="btn primary" onclick="addToCart('${p.id}')">Add to Cart</button>
 </article>`).join("");
}
function addToCart(id){if(!cart.find(x=>x.id===id)){cart.push(products.find(p=>p.id===id));}renderCart();openCart()}
function removeFromCart(id){cart=cart.filter(x=>x.id!==id);renderCart()}
function renderCart(){
 $("#cartCount").textContent=cart.length;
 $("#cartItems").innerHTML=cart.length?cart.map(p=>`<div class="cart-item"><div><strong>${p.name}</strong><small>${money(p.price)}</small></div><button class="remove" onclick="removeFromCart('${p.id}')">Remove</button></div>`).join(""):`<div style="padding:30px 22px;color:#6b756c">Your cart is empty.</div>`;
 $("#cartTotal").textContent=money(cart.reduce((a,p)=>a+p.price,0));
}
function openCart(){$("#cart").classList.add("open");$("#overlay").classList.add("open")}
function closeCart(){$("#cart").classList.remove("open");$("#overlay").classList.remove("open")}
$("#cartButton").onclick=openCart;$("#closeCart").onclick=closeCart;$("#overlay").onclick=closeCart;
$("#checkout").onclick=()=>{if(!cart.length){alert("Your cart is empty.");return}closeCart();$("#orderSummary").innerHTML=cart.map(p=>`${p.name} — <strong>${money(p.price)}</strong>`).join("<br>")+`<hr><strong>Total: ${money(cart.reduce((a,p)=>a+p.price,0))}</strong>`;$("#checkoutModal").classList.add("open")};
$("#closeModal").onclick=()=>$("#checkoutModal").classList.remove("open");
$("#checkoutForm").onsubmit=e=>{e.preventDefault();alert("Demo checkout: connect your approved payment provider here. No payment was taken.");};
$("#year").textContent=new Date().getFullYear();renderProducts();renderCart();
