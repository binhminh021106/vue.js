<template>
  <div class="p-3 border rounded shadow-sm bg-white">
    <h5 class="fw-bold mb-3 skeleton skeleton-text" style="width: 50%;"></h5>
    <div class="skeleton skeleton-input mb-3"></div>

    <h5 class="fw-bold mt-4 mb-3 skeleton skeleton-text" style="width: 70%;"></h5>
    <ul class="list-unstyled sidebar-menu">
      <li v-for="n in 5" :key="n" class="skeleton skeleton-text mb-2" style="height: 24px;"></li>
    </ul>
  </div>
</template>

<style scoped>
.skeleton { background-color: #e0e0e0; border-radius: 4px; animation: shine 1.5s infinite ease-in-out; }
@keyframes shine { 0% { background-color: #e0e0e0; } 50% { background-color: #f0f0f0; } 100% { background-color: #e0e0e0; } }
.skeleton-text { height: 20px; }
.skeleton-input { height: 38px; border-radius: 6px; }
</style>