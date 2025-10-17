<template>
  <div class="container my-5">
    <!-- About Section -->
    <div class="text-center mb-5">
      <h2 class="fw-bold">About Us</h2>
      <p class="text-muted mx-auto" style="max-width: 600px;">
        We are a young team passionate about technology and fashion, on a mission to bring you
        a modern, fast, and high-quality shopping experience.
      </p>
    </div>

    <!-- Image + Description -->
    <div class="row align-items-center mb-5">
      <div class="col-md-6 mb-4 mb-md-0">
        <img
          src="https://outfitvn.online/wp-content/uploads/2025/10/pickleball1.1.jpg"
          class="img-fluid rounded shadow-sm"
          alt="about"
        />
      </div>
      <div class="col-md-6">
        <h4 class="fw-bold mb-3">Our Vision & Mission</h4>
        <p class="text-muted">
          We aim to become a leading e-commerce platform that delivers convenience
          and trust to Vietnamese customers. Every product is carefully selected to ensure
          the best quality and value for our users.
        </p>
        <ul class="list-unstyled mt-3">
          <li><i class="fa fa-check text-success me-2"></i>High-quality products</li>
          <li><i class="fa fa-check text-success me-2"></i>Transparent, competitive prices</li>
          <li><i class="fa fa-check text-success me-2"></i>Fast and safe delivery</li>
          <li><i class="fa fa-check text-success me-2"></i>Dedicated customer support</li>
        </ul>
      </div>
    </div>

    <!-- Team Section -->
    <div class="text-center mb-4">
      <h4 class="fw-bold mb-3">Our Team</h4>
      <p class="text-muted">The people behind your favorite brand 💪</p>
    </div>

    <div class="row g-4 justify-content-center">
      <div class="col-6 col-md-4 col-lg-3" v-for="(member, index) in team" :key="index">
        <div class="card border-0 shadow-sm text-center rounded-4 p-3 h-100">
          <img :src="member.img" class="rounded-circle mx-auto mb-3" width="100" height="100" />
          <h6 class="fw-bold">{{ member.name }}</h6>
          <p class="text-muted small mb-1">{{ member.role }}</p>
          <div class="social-links">
            <a href="#" class="text-dark me-2"><i class="fab fa-facebook"></i></a>
            <a href="#" class="text-dark me-2"><i class="fab fa-instagram"></i></a>
            <a href="#" class="text-dark"><i class="fab fa-github"></i></a>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact -->
    <div class="text-center mt-5">
      <h5 class="fw-bold mb-3">Contact Us</h5>
      <p class="text-muted mb-1">
        <i class="fa fa-envelope me-2"></i>support@minhstore.vn
      </p>
      <p class="text-muted mb-1">
        <i class="fa fa-phone me-2"></i>+84 123 456 789
      </p>
      <p class="text-muted mb-0">
        <i class="fa fa-map-marker me-2"></i>Ho Chi Minh City, Vietnam
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const team = ref([
  {
    name: 'Minh Gio Tai',
    role: 'Founder & Developer',
    img: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
  },
  {
    name: 'Ha My',
    role: 'UI/UX Designer',
    img: 'https://cdn-icons-png.flaticon.com/512/921/921071.png'
  },
  {
    name: 'Khanh Duy',
    role: 'Marketing Lead',
    img: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
  },
  {
    name: 'An Nhien',
    role: 'Customer Support',
    img: 'https://cdn-icons-png.flaticon.com/512/921/921071.png'
  }
])
</script>

<style scoped>
img {
  object-fit: cover;
}

.card img {
  transition: 0.3s ease;
}

.card:hover img {
  transform: scale(1.05);
}

.card:hover {
  transform: translateY(-4px);
  transition: 0.3s;
}
</style>
