<template>
  <div class="container my-5">
    <h2 class="fw-bold text-center mb-4">📦 My Orders</h2>

    <div class="order-list">
      <!-- Order card -->
      <div class="card border-0 shadow-sm rounded-4 mb-4 p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 class="fw-semibold mb-1">Order #ODR2025-001</h5>
            <small class="text-muted">Placed on October 10, 2025</small>
          </div>
          <span class="badge bg-success px-3 py-2">Delivered</span>
        </div>

        <!-- Product list -->
        <div class="d-flex align-items-center mb-3 border-bottom pb-2">
          <img
            src="https://static.nike.com/a/images/t_default/1/Nike-Air-Force-1-07-White.jpg"
            alt="Nike Air Force 1"
            width="60"
            height="60"
            class="rounded border me-3"
          />
          <div class="flex-grow-1">
            <p class="mb-1 fw-semibold">Nike Air Force 1</p>
            <small class="text-muted">x1 — 1,250,000 ₫</small>
          </div>
          <span class="fw-bold text-danger">1,250,000 ₫</span>
        </div>

        <div class="d-flex align-items-center mb-3 border-bottom pb-2">
          <img
            src="https://assets.adidas.com/images/w_600,f_auto,q_auto/1a7b0e02c9264b14a3d4aafd0094a72a_9366/Giay_Superstar_trang_FV3284_01_standard.jpg"
            alt="Adidas Superstar"
            width="60"
            height="60"
            class="rounded border me-3"
          />
          <div class="flex-grow-1">
            <p class="mb-1 fw-semibold">Adidas Superstar</p>
            <small class="text-muted">x1 — 1,100,000 ₫</small>
          </div>
          <span class="fw-bold text-danger">1,100,000 ₫</span>
        </div>

        <!-- Footer info -->
        <div class="d-flex justify-content-between mt-3">
          <div>
            <small class="text-muted">Payment:</small>
            <p class="mb-0 fw-semibold">Cash on Delivery (COD)</p>
          </div>
          <div class="text-end">
            <small class="text-muted">Total:</small>
            <p class="mb-0 fw-bold text-danger">2,350,000 ₫</p>
          </div>
        </div>

        <div class="text-end mt-3">
          <button class="btn btn-outline-dark btn-sm">
            View Details
          </button>
        </div>
      </div>

      <!-- Another Order -->
      <div class="card border-0 shadow-sm rounded-4 mb-4 p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 class="fw-semibold mb-1">Order #ODR2025-002</h5>
            <small class="text-muted">Placed on October 5, 2025</small>
          </div>
          <span class="badge bg-warning text-dark px-3 py-2">Pending</span>
        </div>

        <div class="d-flex align-items-center mb-3 border-bottom pb-2">
          <img
            src="https://converse.com.vn/wp-content/uploads/2022/10/Converse-Chuck-70-Classic-Black-162050C-1.jpg"
            alt="Converse Chuck 70"
            width="60"
            height="60"
            class="rounded border me-3"
          />
          <div class="flex-grow-1">
            <p class="mb-1 fw-semibold">Converse Chuck 70</p>
            <small class="text-muted">x1 — 950,000 ₫</small>
          </div>
          <span class="fw-bold text-danger">950,000 ₫</span>
        </div>

        <div class="d-flex justify-content-between mt-3">
          <div>
            <small class="text-muted">Payment:</small>
            <p class="mb-0 fw-semibold">MoMo E-Wallet</p>
          </div>
          <div class="text-end">
            <small class="text-muted">Total:</small>
            <p class="mb-0 fw-bold text-danger">950,000 ₫</p>
          </div>
        </div>

        <div class="text-end mt-3">
          <button class="btn btn-outline-dark btn-sm">
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  transition: 0.3s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.order-list {
  max-width: 800px;
  margin: auto;
}

.badge {
  font-size: 0.85rem;
  border-radius: 12px;
}

img {
  object-fit: cover;
}

.btn {
  border-radius: 10px;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
}
</style>
