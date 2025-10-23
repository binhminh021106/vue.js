<template>
  <div class="container my-5 skeleton-loader">
    <div class="row g-4">
      <div class="col-md-6">
        <div class="border rounded p-3 bg-white shadow-sm">
          <div class="skeleton main-img-skel"></div>
          <div class="d-flex gap-2 flex-wrap mt-3">
            <div class="skeleton small-img-skel"></div>
            <div class="skeleton small-img-skel"></div>
            <div class="skeleton small-img-skel"></div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="p-3">
          <div class="skeleton title-skel"></div>
          <div class="skeleton text-skel-short mt-2"></div>
          <div class="skeleton text-skel-long mt-3"></div>
          <div class="skeleton text-skel-short mt-3"></div>
          <div class="skeleton text-skel-short mt-4"></div>
          <div class="skeleton text-skel-long mt-4"></div>
          
          <div class="mt-4 d-flex gap-3 flex-wrap">
            <div class="skeleton btn-skel"></div>
            <div class="skeleton btn-skel"></div>
          </div>
          
          <hr class="my-4" />
          
          <div>
            <div class="skeleton text-skel-short mb-2"></div>
            <div class="skeleton text-skel-long"></div>
            <div class="skeleton text-skel-long mt-2"></div>
            <div class="skeleton text-skel-long mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component này không cần script
</script>

<style scoped>
.skeleton {
  background-color: #e0e0e0; /* Màu xám mờ */
  border-radius: 4px;
  /* Hiệu ứng nhấp nháy */
  animation: shine 1.5s infinite ease-in-out;
}

/* Các khối "xương" mô phỏng layout của bạn */
.main-img-skel {
  height: 400px;
  width: 100%;
}

.small-img-skel {
  width: 70px;
  height: 70px;
}

.title-skel {
  height: 32px;
  width: 70%;
  border-radius: 6px;
}

.text-skel-short {
  height: 20px;
  width: 40%;
}

.text-skel-long {
  height: 20px;
  width: 90%;
}

.btn-skel {
  height: 42px;
  width: 140px;
  border-radius: 8px;
}

/* Animation nhấp nháy */
@keyframes shine {
  0% {
    background-color: #e0e0e0;
  }
  50% {
    background-color: #f0f0f0; /* Sáng lên */
  }
  100% {
    background-color: #e0e0e0;
  }
}

/* Giống media query trong code của bạn */
@media (max-width: 768px) {
  .main-img-skel {
    height: 300px;
  }
}
</style>