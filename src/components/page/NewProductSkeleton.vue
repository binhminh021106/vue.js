<template>
  <div class="category-scroll d-flex gap-4 overflow-auto pb-2">
    <div v-for="n in 5" :key="n" class="product-card flex-shrink-0 border-0 shadow-sm text-center bg-white rounded-3 overflow-hidden" style="width: 250px">
      <div class="skeleton new-product-img-skel"></div>
      <div class="p-3">
        <div class="skeleton text-skel-short mx-auto"></div>
        <div class="skeleton text-skel-long mx-auto mt-2"></div>
        <div class="skeleton btn-skel mx-auto mt-3"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton { background-color: #e0e0e0; border-radius: 4px; animation: shine 1.5s infinite ease-in-out; }
.new-product-img-skel { width: 100%; height: 260px; }
.text-skel-short { height: 20px; width: 80%; }
.text-skel-long { height: 18px; width: 60%; background-color: #e8e8e8; }
.btn-skel { height: 31px; width: 120px; border-radius: 16px; }
@keyframes shine { 0% { background-color: #e0e0e0; } 50% { background-color: #f0f0f0; } 100% { background-color: #e0e0e0; } }
</style>