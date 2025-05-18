
      const cart = [
        { name: "First Product", description: "Description", price:2000 },
        { name: "Second product", description: "Description", price: 800 },
        { name: "Third Product", description: "Description", price: 100 },
        { name: "Fourth Product", description: "Description", price: 500 },
        { name: "Fourth Product", description: "Description", price: 500 }
      ];

      function updateCart() {
        const cartList = document.getElementById("cart-items");
        const cartCount = document.getElementById("cart-count");
        cartList.innerHTML = "";
        let total = 0;

        cart.forEach(item => {
          const li = document.createElement("li");
          li.className = "list-group-item d-flex justify-content-between lh-sm";
          li.innerHTML = `
            <div>
              <h6 class="my-0">${item.name}</h6>
              <small class="text-muted">${item.description}</small>
            </div>
            <span class="text-muted">${item.price} LE</span>
          `;
          cartList.appendChild(li);
          total += item.price;
        });

        const totalLi = document.createElement("li");
        totalLi.className = "list-group-item d-flex justify-content-between";
        totalLi.innerHTML = `
          <span>Total</span>
          <strong>${total} LE</strong>
        `;
        cartList.appendChild(totalLi);
        cartCount.textContent = cart.length;
      }


      (function () {
        'use strict';
        var forms = document.querySelectorAll('.needs-validation');
        Array.prototype.slice.call(forms).forEach(function (form) {
          form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
              event.preventDefault();
              event.stopPropagation();
            }
            form.classList.add('was-validated');
          }, false);
        });
      })();


      const creditOption = document.getElementById('credit');
      const cashOption = document.getElementById('cash');
      const creditFields = document.getElementById('credit-card-fields');
      const creditInputs = [
        document.getElementById('cc-name'),
        document.getElementById('cc-number'),
        document.getElementById('cc-expiration'),
        document.getElementById('cc-cvv')
      ];

      function toggleCreditFields() {
        if (creditOption.checked) {
          creditFields.style.display = 'block';
          creditInputs.forEach(input => input.setAttribute('required', ''));
        } else {
          creditFields.style.display = 'none';
          creditInputs.forEach(input => input.removeAttribute('required'));
        }
      }

      creditOption.addEventListener('change', toggleCreditFields);
      cashOption.addEventListener('change', toggleCreditFields);
      window.addEventListener('load', () => {
        toggleCreditFields();
        updateCart(); 
      });