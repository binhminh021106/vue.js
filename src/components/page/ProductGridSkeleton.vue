<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="skeleton skeleton-text" style="width: 150px;"></div>
      <div class="skeleton skeleton-select" style="width: 180px;"></div>
    </div>

    <div class="row g-4">
      <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="n in 8" :key="n">
        <div class="card border-0 shadow-sm h-100">
          <div class="skeleton skeleton-img"></div>
          <div class="card-body text-center">
            <div class="skeleton skeleton-text mx-auto" style="width: 60%;"></div>
            <div class="skeleton skeleton-text mx-auto mt-2" style="width: 80%;"></div>
            <div class="skeleton skeleton-text mx-auto mt-2" style="width: 40%;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton { background-color: #e0e0e0; border-radius: 4px; animation: shine 1.5s infinite ease-in-out; }
@keyframes shine { 0% { background-color: #e0e0e0; } 50% { background-color: #f0f0f0; } 100% { background-color: #e0e0e0; } }
.skeleton-text { height: 20px; }
.skeleton-select { height: 38px; border-radius: 6px; }
.skeleton-img { height: 260px; border-bottom: 1px solid #f0f0f0; }
</style>