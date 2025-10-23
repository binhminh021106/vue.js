<template>
  <div class="coupons-grid">
    <div v-for="n in 3" :key="n" class="coupon-card skeleton-card">
      <div class="coupon-icon skeleton skeleton-icon"></div>
      <div class="coupon-info">
        <div class="skeleton skeleton-text" style="width: 70%;"></div>
        <div class="skeleton skeleton-text" style="width: 50%; margin-top: 6px;"></div>
      </div>
      <div class="coupon-action">
        <div class="skeleton skeleton-btn"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Lấy style từ file coupon.vue */
.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}
.coupon-card {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding: 8px 12px;
  position: relative;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  border: 1px solid #444957;
  min-height: 70px;
}
.coupon-icon { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; margin-right: 10px; }
.coupon-info { flex-grow: 1; }
.coupon-action { padding-left: 10px; border-left: 2px dashed #e0e0e0; flex-shrink: 0; }

/* CSS cho Skeleton */
.skeleton {
  background-color: #e0e0e0;
  border-radius: 4px;
  animation: shine 1.5s infinite ease-in-out;
}
@keyframes shine {
  0% { background-color: #e0e0e0; }
  50% { background-color: #f0f0f0; }
  100% { background-color: #e0e0e0; }
}

/* Kích thước cụ thể cho skeleton */
.skeleton-card {
    border-color: #e0e0e0;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}
.skeleton-icon { border-radius: 50%; }
.skeleton-text { height: 16px; }
.skeleton-btn { width: 70px; height: 30px; border-radius: 6px; }
</style>