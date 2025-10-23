<template>
  <div class="row g-4 justify-content-center">
    <div v-for="n in 5" :key="n" class="col-6 col-md-4 col-lg-2">
      <div class="card border-0 shadow-sm h-100 rounded-3 product-card">
        <div class="skeleton top-product-img-skel"></div>
        <div class="card-body text-center">
          <div class="skeleton text-skel-short mx-auto"></div>
          <div class="skeleton text-skel-long mx-auto mt-2"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton { background-color: #e0e0e0; border-radius: 4px; animation: shine 1.5s infinite ease-in-out; }
.top-product-img-skel { height: 180px; width: 100%; }
.text-skel-short { height: 20px; width: 70%; }
.text-skel-long { height: 16px; width: 50%; background-color: #e8e8e8; }
@keyframes shine { 0% { background-color: #e0e0e0; } 50% { background-color: #f0f0f0; } 100% { background-color: #e0e0e0; } }
</style>