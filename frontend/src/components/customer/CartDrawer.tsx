/* =========================================================
   CART PAGE
========================================================= */

.cart-page {
  min-height: 100vh;
  background: #fafafa;
  padding: 120px 25px 70px;
  color: #222;
}

.cart-page-container {
  width: min(1180px, 100%);
  margin: 0 auto;
}


/* =========================================================
   HEADER
========================================================= */

.cart-page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 35px;
}

.cart-page-label {
  display: block;
  margin-bottom: 6px;

  color: #e31b23;

  font-size: 12px;
  font-weight: 800;

  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.cart-page-header h1 {
  margin: 0 0 8px;

  color: #222;

  font-size: clamp(32px, 5vw, 48px);
  font-weight: 900;
  line-height: 1.1;
}

.cart-page-header p {
  margin: 0;

  color: #777;

  font-size: 15px;
}

.cart-continue-btn {
  border: 1px solid #ddd;
  border-radius: 10px;

  background: #fff;
  color: #333;

  padding: 13px 18px;

  display: inline-flex;
  align-items: center;
  gap: 9px;

  font-size: 14px;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s ease;
}

.cart-continue-btn:hover {
  border-color: #e31b23;
  color: #e31b23;
}


/* =========================================================
   MAIN GRID
========================================================= */

.cart-page-grid {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    360px;

  gap: 30px;

  align-items: start;
}


/* =========================================================
   ITEMS CARD
========================================================= */

.cart-page-items {
  background: #fff;

  border: 1px solid #eee;
  border-radius: 18px;

  padding: 25px;

  box-shadow:
    0 10px 35px rgba(0, 0, 0, 0.05);
}

.cart-page-items-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding-bottom: 18px;

  border-bottom: 1px solid #eee;
}

.cart-page-items-header h3 {
  margin: 0;

  font-size: 21px;
  font-weight: 800;

  color: #222;
}

.cart-clear-btn {
  border: none;

  background: transparent;
  color: #999;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;

  display: inline-flex;
  align-items: center;
  gap: 7px;

  transition: 0.2s ease;
}

.cart-clear-btn:hover {
  color: #e31b23;
}


/* =========================================================
   ITEM
========================================================= */

.cart-page-item {
  display: grid;

  grid-template-columns:
    80px
    minmax(0, 1fr)
    auto;

  gap: 18px;

  align-items: center;

  padding: 22px 0;

  border-bottom: 1px solid #eee;
}

.cart-page-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}


/* =========================================================
   ITEM IMAGE
========================================================= */

.cart-page-item-image {
  width: 80px;
  height: 80px;

  border-radius: 14px;

  background: #fff1df;
  color: #e31b23;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 26px;
}


/* =========================================================
   ITEM DETAILS
========================================================= */

.cart-page-item-details {
  min-width: 0;
}

.cart-page-item-details h4 {
  margin: 0 0 6px;

  color: #222;

  font-size: 17px;
  font-weight: 800;
}

.cart-page-item-details p {
  margin: 0 0 7px;

  max-width: 500px;

  color: #888;

  font-size: 13px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-page-item-type {
  display: inline-block;

  margin-bottom: 8px;

  padding: 4px 8px;

  border-radius: 5px;

  background: #f5f5f5;

  color: #777;

  font-size: 10px;
  font-weight: 700;

  text-transform: uppercase;
}

.cart-page-item-price {
  color: #555;

  font-size: 14px;
  font-weight: 700;
}


/* =========================================================
   ITEM ACTIONS
========================================================= */

.cart-page-item-actions {
  min-width: 120px;

  display: flex;
  flex-direction: column;

  align-items: flex-end;

  gap: 9px;
}

.cart-page-quantity {
  display: flex;
  align-items: center;

  border: 1px solid #ddd;
  border-radius: 8px;

  overflow: hidden;
}

.cart-page-quantity button {
  width: 30px;
  height: 30px;

  border: none;

  background: #f7f7f7;
  color: #333;

  font-size: 18px;

  cursor: pointer;

  transition: 0.2s ease;
}

.cart-page-quantity button:hover {
  background: #e31b23;
  color: #fff;
}

.cart-page-quantity span {
  width: 32px;

  text-align: center;

  color: #222;

  font-size: 13px;
  font-weight: 800;
}

.cart-page-item-total {
  color: #e31b23;

  font-size: 16px;
  font-weight: 800;
}

.cart-page-remove {
  border: none;

  background: transparent;
  color: #999;

  padding: 0;

  display: inline-flex;
  align-items: center;
  gap: 5px;

  font-size: 11px;

  cursor: pointer;

  transition: 0.2s ease;
}

.cart-page-remove:hover {
  color: #e31b23;
}


/* =========================================================
   SUMMARY
========================================================= */

.cart-page-summary {
  position: sticky;
  top: 100px;
}

.cart-summary-card {
  background: #fff;

  border: 1px solid #eee;
  border-radius: 18px;

  padding: 25px;

  box-shadow:
    0 10px 35px rgba(0, 0, 0, 0.06);
}

.cart-summary-card-header {
  margin-bottom: 22px;
}

.cart-summary-card-header span {
  display: block;

  margin-bottom: 5px;

  color: #e31b23;

  font-size: 11px;
  font-weight: 800;

  letter-spacing: 1.2px;
}

.cart-summary-card-header h3 {
  margin: 0;

  color: #222;

  font-size: 24px;
  font-weight: 900;
}

.cart-summary-line {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 14px;

  color: #777;

  font-size: 14px;
}

.cart-summary-line strong {
  color: #333;
}

.free-delivery {
  color: #159447 !important;
}

.cart-summary-divider {
  height: 1px;

  background: #eee;

  margin: 20px 0;
}

.cart-summary-grand-total {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 22px;

  color: #222;

  font-size: 17px;
  font-weight: 800;
}

.cart-summary-grand-total strong {
  color: #e31b23;

  font-size: 24px;
}


/* =========================================================
   CHECKOUT BUTTON
========================================================= */

.cart-checkout-btn {
  width: 100%;
  min-height: 54px;

  border: none;
  border-radius: 10px;

  background: #e31b23;
  color: #fff;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 10px;

  font-size: 15px;
  font-weight: 800;

  cursor: pointer;

  transition: 0.2s ease;
}

.cart-checkout-btn:hover {
  background: #c9151c;

  transform: translateY(-1px);

  box-shadow:
    0 10px 25px rgba(227, 27, 35, 0.2);
}

.cart-secure-note {
  margin-top: 15px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  color: #999;

  font-size: 11px;
}


/* =========================================================
   TRUST BOX
========================================================= */

.cart-trust-box {
  margin-top: 15px;

  padding: 18px;

  border-radius: 14px;

  background: #fff;

  border: 1px solid #eee;
}

.cart-trust-item {
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 8px 0;

  color: #666;

  font-size: 12px;
}

.cart-trust-item i {
  width: 20px;

  color: #e31b23;

  text-align: center;
}


/* =========================================================
   EMPTY CART
========================================================= */

.cart-empty-page {
  min-height: 480px;

  background: #fff;

  border: 1px solid #eee;
  border-radius: 18px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  text-align: center;

  padding: 40px;

  box-shadow:
    0 10px 35px rgba(0, 0, 0, 0.04);
}

.cart-empty-icon {
  width: 90px;
  height: 90px;

  border-radius: 50%;

  background: #fff1df;
  color: #e31b23;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 35px;

  margin-bottom: 20px;
}

.cart-empty-page h2 {
  margin: 0 0 8px;

  color: #222;

  font-size: 26px;
  font-weight: 800;
}

.cart-empty-page p {
  margin: 0 0 25px;

  color: #888;

  font-size: 14px;
}

.cart-back-menu-btn {
  border: none;
  border-radius: 9px;

  background: #e31b23;
  color: #fff;

  padding: 13px 20px;

  display: inline-flex;
  align-items: center;
  gap: 9px;

  font-size: 14px;
  font-weight: 800;

  cursor: pointer;
}


/* =========================================================
   LOADING
========================================================= */

.cart-page-loading {
  min-height: 100vh;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  color: #777;
}

.cart-page-loading .loading-spinner {
  width: 35px;
  height: 35px;

  border: 3px solid #eee;
  border-top-color: #e31b23;

  border-radius: 50%;

  animation: cartPageSpin 0.8s linear infinite;

  margin-bottom: 12px;
}

@keyframes cartPageSpin {
  to {
    transform: rotate(360deg);
  }
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 900px) {

  .cart-page-grid {
    grid-template-columns: 1fr;
  }

  .cart-page-summary {
    position: static;
  }

}


@media (max-width: 650px) {

  .cart-page {
    padding: 100px 15px 50px;
  }

  .cart-page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .cart-continue-btn {
    width: 100%;
    justify-content: center;
  }

  .cart-page-items {
    padding: 18px;
  }

  .cart-page-item {
    grid-template-columns:
      65px
      minmax(0, 1fr);

    gap: 12px;
  }

  .cart-page-item-image {
    width: 65px;
    height: 65px;
  }

  .cart-page-item-actions {
    grid-column: 1 / -1;

    width: 100%;

    flex-direction: row;

    align-items: center;
    justify-content: space-between;
  }

  .cart-page-item-details p {
    white-space: normal;
  }

}


@media (max-width: 400px) {

  .cart-page-header h1 {
    font-size: 32px;
  }

  .cart-summary-card {
    padding: 20px;
  }

}