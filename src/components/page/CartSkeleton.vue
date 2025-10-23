<template>
  <div class="row g-4">
    <div class="col-lg-8">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <div v-for="n in 3" :key="n" class="d-flex align-items-center mb-4 pb-4 border-bottom">
            <div class="skeleton skeleton-img"></div>
            <div class="flex-grow-1 ms-3">
              <div class="skeleton skeleton-text w-75"></div>
              <div class="skeleton skeleton-text w-50 mt-2"></div>
            </div>
            <div class="skeleton skeleton-text" style="width: 80px;"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="col-lg-4">
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <h5 class="fw-bold mb-3 skeleton skeleton-text w-50"></h5>
          <div class="skeleton skeleton-text w-100 mb-2"></div>
          <div class="skeleton skeleton-text w-100 mb-2"></div>
          <hr />
          <div class="skeleton skeleton-text w-100 mb-3"></div>
          <div class="skeleton skeleton-btn w-100"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No script needed
</script>

<style scoped>
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
.skeleton-img { width: 70px; height: 70px; border-radius: 8px; }
.skeleton-text { height: 20px; }
.skeleton-btn { height: 45px; border-radius: 8px; }
</style>