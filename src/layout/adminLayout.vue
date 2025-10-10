<template>
  <div class="admin-layout d-flex flex-column min-vh-100 bg-light">
    <!-- HEADER -->
    <header class="admin-header d-flex align-items-center justify-content-between px-4 py-3 shadow-sm bg-white">
      <div class="d-flex align-items-center gap-3">
        <img
          src="https://www.accuratereviews.com/wp-content/uploads/2021/07/outfit-logo-padding.png"
          alt="logo"
          width="120"
        />
        <h5 class="fw-bold mb-0 text-dark">OutfitVN Admin Dashboard</h5>
      </div>
      <div class="d-flex align-items-center gap-3">
        <i class="fa-regular fa-bell fs-5 text-dark"></i>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="avatar"
          class="rounded-circle border"
          width="40"
          height="40"
        />
      </div>
    </header>

    <div class="d-flex flex-grow-1">
      <!-- SIDEBAR -->
      <aside class="sidebar shadow-sm bg-white">
        <ul class="list-unstyled d-flex flex-column gap-2 mt-3">
          <li>
            <router-link to="/admin/user" class="nav-link" active-class="active-link">
              <i class="fa-solid fa-user me-2"></i>Người dùng
            </router-link>
          </li>
          <li>
            <router-link to="/admin/categories" class="nav-link" active-class="active-link">
              <i class="fa-solid fa-layer-group me-2"></i>Danh mục
            </router-link>
          </li>
          <li>
            <router-link to="/admin/product" class="nav-link" active-class="active-link">
              <i class="fa-solid fa-box me-2"></i>Sản phẩm
            </router-link>
          </li>
          <li>
            <router-link to="/admin/adminorder" class="nav-link" active-class="active-link">
              <i class="fa-solid fa-receipt me-2"></i>Đơn hàng
            </router-link>
          </li>
        </ul>

        <div class="mt-auto text-center pt-4 border-top">
          <router-link to="/" class="btn btn-dark btn-sm w-100">
            <i class="fa-solid fa-arrow-left me-2"></i>Về trang người dùng
          </router-link>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="main-content flex-fill p-4">
        <router-view />
      </main>
    </div>

    <!-- FOOTER -->
    <footer class="admin-footer text-center py-3 bg-white shadow-sm">
      <p class="mb-0 small text-secondary">
        &copy; 2025 <b>OutfitVN</b> — Trang quản trị hệ thống
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* ===== GENERAL ===== */
.admin-layout {
  font-family: "Poppins", sans-serif;
  background-color: #f8f9fa;
  color: #333;
}

/* ===== HEADER ===== */
.admin-header {
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.admin-header img {
  object-fit: contain;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 240px;
  background: #fff;
  padding: 20px 15px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.nav-link {
  display: block;
  color: #555;
  background: transparent;
  padding: 10px 15px;
  border-radius: 10px;
  font-weight: 500;
  transition: 0.3s ease;
  text-decoration: none;
}

.nav-link i {
  color: #f8d210;
}

.nav-link:hover {
  background: #f8f9fa;
  color: #000;
  transform: translateX(3px);
}

.active-link {
  background-color: #f8d210;
  color: #000 !important;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(248, 210, 16, 0.3);
}

/* ===== MAIN CONTENT ===== */
.main-content {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin: 20px;
  overflow: hidden;
}

/* ===== FOOTER ===== */
.admin-footer {
  font-size: 0.9rem;
  color: #666;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 991px) {
  .d-flex {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: 10px;
    border-right: none;
    border-top: 1px solid #eee;
  }

  .main-content {
    margin: 10px;
  }

  .admin-header {
    flex-direction: column;
    align-items: start;
  }
}
</style>
    