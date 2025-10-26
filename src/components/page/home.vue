<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import coupon from './coupon.vue'
import axios from 'axios'
import { toast } from 'vue3-toastify';

import CategorySkeleton from './CategorySkeleton.vue'
import TopProductSkeleton from './TopProductSkeleton.vue'
import NewProductSkeleton from './NewProductSkeleton.vue'

const store = useStore()
const router = useRouter()
const API_URL = import.meta.env.VITE_API_BASE_URL;

const category = computed(() => store.getters.getCategories);
const topProducts = ref([])
const products = ref([])

const isLoadingCategories = ref(true);
const isLoadingTopProducts = ref(true);
const isLoadingNewProducts = ref(true);
const addingProductId = ref(null);

const scrollContainer = ref(null)
const scrollLeft = () => scrollContainer.value.scrollBy({ left: -350, behavior: 'smooth' })
const scrollRight = () => scrollContainer.value.scrollBy({ left: 350, behavior: 'smooth' })

const productScroll = ref(null)
const scrollProductLeft = () => productScroll.value.scrollBy({ left: -350, behavior: 'smooth' })
const scrollProductRight = () => productScroll.value.scrollBy({ left: 350, behavior: 'smooth' })


const readProduct = async () => {
  isLoadingNewProducts.value = true;
  try {
    const res = await axios.get(`${API_URL}/products`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    })
    products.value = res.data
  } catch (err) {
    console.error("Error fetching products:", err)
  } finally {
    isLoadingNewProducts.value = false;
  }
}

const addtocart = async (product) => {
  addingProductId.value = product.id;
  try {
    await store.dispatch('addToCart', { product, quantity: 1 })
    toast.success("Product added to cart", {
      autoClose: 3000,
      position: "top-right",
    });
  } catch (err) {
    if (err.message === 'User not logged in') {
      Swal.fire({
        icon: "warning",
        title: "Please log in",
        text: "You must be logged in to add products to your cart.",
        confirmButtonColor: "#000"
      })
      router.push("/login")
    } else {
      console.error("Error adding to cart:", err)
      toast.error("Could not add product to cart.", {
        autoClose: 3000,
        position: "top-right",
      });
    }
  } finally {
    addingProductId.value = null;
  }
}

const getTop5 = async () => {
  isLoadingTopProducts.value = true;
  try {
    const res = await axios.get(`${API_URL}/order`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    })
    const orders = res.data

    const allProducts = orders
      .filter(o => o.status === 'Delivered')
      .flatMap(o => o.products)

    const productCount = {}
    for (const p of allProducts) {
      if (!productCount[p.productId]) {
        productCount[p.productId] = {
          id: p.productId,
          name: p.name,
          image: p.image,
          totalSold: 0
        }
      }
      productCount[p.productId].totalSold += p.quantity
    }

    const sorted = Object.values(productCount).sort((a, b) => b.totalSold - a.totalSold)

    topProducts.value = sorted.slice(0, 5)

  } catch (err) {
    console.error('Lỗi lấy top 5:', err)
  } finally {
    isLoadingTopProducts.value = false;
  }
}

onMounted(async () => {
  if (store.getters.getCategories.length > 0) {
    isLoadingCategories.value = false;
  } else {
    isLoadingCategories.value = true;
    try {
      await store.dispatch('fetchCategories');
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      isLoadingCategories.value = false;
    }
  }

  readProduct();
  getTop5();
})
</script>

<template>
  <div class="home">

    <!-- HERO SECTION -->
    <section class="hero d-flex justify-content-center align-items-center text-center text-white">
      <div class="overlay"></div>
      <div class="content">
        <h1 class="fw-bold display-4 mb-3">Sport Men's Fashion</h1>
        <p class="lead mb-4">Style, quality & your own personality</p>
        <router-link to="/shop" class="btn btn-light fw-semibold px-4 py-2 rounded-pill shadow-sm hover-scale">
          <i class="fa fa-shopping-bag me-2"></i> Shop Now
        </router-link>
      </div>
    </section>

    <!-- FEATURED CATEGORIES -->
    <section class="container my-5 position-relative">
      <h2 class="section-title text-center mb-4">Featured Categories</h2>

      <!-- Scroll buttons -->
      <button v-if="!isLoadingCategories" class="scroll-btn left" @click="scrollLeft"><i
          class="fa fa-chevron-left"></i></button>
      <button v-if="!isLoadingCategories" class="scroll-btn right" @click="scrollRight"><i
          class="fa fa-chevron-right"></i></button>
      <!-- Category Scroll -->
      <div v-if="!isLoadingCategories" class="category-scroll d-flex gap-4 overflow-auto pb-2" ref="scrollContainer">
        <div v-for="items in category" :key="items.id" class="category-item flex-shrink-0">
          <div class="image-wrapper position-relative rounded-3 overflow-hidden shadow-sm">
            <img :src="items.image" alt="Category" />
            <div class="overlay d-flex flex-column justify-content-center align-items-center text-center">
              <h5 class="text-white fw-bold mb-2">{{ items.nameCategory }}</h5>
              <button class="btn btn-light btn-sm rounded-pill shadow-sm px-3">Explore</button>
            </div>
          </div>
          <div class="text-center mt-3">
            <p class="fw-semibold mb-1">{{ items.nameCategory }}</p>
            <p class="text-muted small mb-0">{{ items.moTa }}</p>
          </div>
        </div>
      </div>
      <CategorySkeleton v-else />
    </section>

    <!-- COUPON SECTION -->
    <section class="container my-5">
      <h2 class="section-title text-center mb-4">Hot Coupons</h2>
      <coupon />
    </section>

    <!-- TOP 5 PRODUCTS -->
    <section class="container my-5">
      <h2 class="section-title text-center mb-4">Top 5 Best-Selling Products</h2>

      <div v-if="!isLoadingTopProducts" class="row g-4 justify-content-center">
        <div v-for="(p, index) in topProducts" :key="p.id" class="col-6 col-md-4 col-lg-2">
          <div class="card border-0 shadow-sm h-100 position-relative overflow-hidden rounded-3 product-card">
            <span class="rank-badge position-absolute top-0 start-0 m-2 badge rounded-pill text-white px-3 py-2">
              #{{ index + 1 }}
            </span>

            <router-link :to="`/productDetail/${p.id}`" class="text-decoration-none">
              <img :src="p.image" class="card-img-top" alt="Top product" />
            </router-link>

            <div class="card-body text-center">
              <h6 class="fw-bold text-truncate mb-2">{{ p.name }}</h6>
              <p class="text-muted small mb-0">
                Sold: <span class="fw-semibold text-danger">{{ p.totalSold }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <TopProductSkeleton v-else />
    </section>

    <!-- NEW PRODUCTS -->
    <section class="container my-5 position-relative">
      <h2 class="section-title text-center mb-4">New Arrivals</h2>

      <!-- Scroll buttons -->
      <button v-if="!isLoadingNewProducts" class="scroll-btn left" @click="scrollProductLeft"><i
          class="fa fa-chevron-left"></i></button>
      <button v-if="!isLoadingNewProducts" class="scroll-btn right" @click="scrollProductRight"><i
          class="fa fa-chevron-right"></i></button>

      <!-- Product Scroll -->
      <div v-if="!isLoadingNewProducts" class="category-scroll d-flex gap-4 overflow-auto pb-2" ref="productScroll">
        <div v-for="item in products" :key="item.id"
          class="product-card flex-shrink-0 border-0 shadow-sm text-center bg-white rounded-3 overflow-hidden"
          style="width: 250px">

          <router-link :to="`/productDetail/${item.id}`" class="text-decoration-none text-dark">
            <div class="position-relative">
              <img :src="item.image[0]" alt="product" class="product-img" />
              <span v-if="item.discount < item.price"
                class="discount-badge badge bg-danger position-absolute top-0 start-0 m-2 px-2 py-1">
                -{{ Math.round(100 - (item.discount / item.price) * 100) }}%
              </span>
            </div>
          </router-link>

          <div class="p-3">
            <h6 class="fw-semibold mb-1">{{ item.name }}</h6>

            <template v-if="item.discount < item.price">
              <p class="text-muted text-decoration-line-through small mb-1">
                {{ Number(item.price).toLocaleString('vi-VN') }} ₫
              </p>
              <p class="fw-bold mb-1 text-danger">
                {{ Number(item.discount).toLocaleString('vi-VN') }} ₫
              </p>
            </template>

            <template v-else>
              <p class="fw-bold mb-2">{{ Number(item.price).toLocaleString('vi-VN') }} ₫</p>
            </template>

            <button v-if="item.quantity > 0" @click="addtocart(item)" class="btn btn-dark btn-sm mt-1"
              :disabled="addingProductId === item.id">
              <span v-if="addingProductId === item.id" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
              <i v-else class="fa fa-shopping-cart me-2"></i>
              {{ addingProductId === item.id ? 'Adding...' : 'Add to cart' }}
            </button>
            <button v-else class="btn btn-danger btn-sm mt-1" disabled>
              Out of Stock
            </button>
          </div>
        </div>
      </div>
      <NewProductSkeleton v-else />
    </section>

  </div>
</template>

<style scoped>
.hero {
  position: relative;
  background: url("https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1600&q=80") center/cover no-repeat;
  height: 85vh;
  border-radius: 0 0 40px 40px;
  overflow: hidden;
}

.hero .overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.hero .content {
  position: relative;
  z-index: 2;
  max-width: 700px;
}

.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.08);
}

/* 🏷️ TITLES */
.section-title {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #111;
  position: relative;
}

.section-title::after {
  content: "";
  display: block;
  width: 80px;
  height: 3px;
  background: #000;
  margin: 10px auto 0;
  border-radius: 3px;
}

/* ⬅️➡️ SCROLL BUTTONS */
.scroll-btn {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  background: #000;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 5;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.scroll-btn:hover {
  background: #222;
  transform: translateY(-50%) scale(1.1);
}

.scroll-btn.left {
  left: -15px;
}

.scroll-btn.right {
  right: -15px;
}

/* 🖼️ CATEGORY SECTION */
.category-scroll {
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-item {
  width: 260px;
}

.image-wrapper img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: transform 0.4s ease, filter 0.3s ease;
}

.image-wrapper:hover img {
  transform: scale(1.08);
  filter: brightness(0.7);
}

.overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  background: rgba(0, 0, 0, 0.4);
  transition: opacity 0.3s ease;
}

.image-wrapper:hover .overlay {
  opacity: 1;
}

/* 🏆 TOP PRODUCT */
.card-img-top {
  height: 180px;
  object-fit: cover;
}

.rank-badge {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

/* 🆕 PRODUCT CARDS */
.product-card {
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.product-img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.discount-badge {
  font-size: 0.8rem;
  border-radius: 6px;
}
</style>
