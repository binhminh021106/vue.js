<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const category = ref([])
const products = ref([])
const allProducts = ref([])
const searchQuery = ref('')
const sortOption = ref('Default sort')
const selectedCategory = ref(null)

const readCategory = async () => {
  try {
    const res = await axios.get('http://localhost:3000/categories')
    category.value = res.data
  } catch (err) {
    console.error('Error category:', err)
  }
}

const readProduct = async () => {
  try {
    const res = await axios.get('http://localhost:3000/products')
    allProducts.value = res.data
    products.value = [...allProducts.value]
    sortProducts()
  } catch (err) {
    console.error('Error product:', err)
  }
}

const sortProducts = () => {
  let sorted = [...products.value]

  switch (sortOption.value) {
    case 'A -> Z':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }))
      break
    case 'Z -> A':
      sorted.sort((a, b) => b.name.localeCompare(a.name, 'vi', { sensitivity: 'base' }))
      break
    case 'Price: Low to High':
      sorted.sort((a, b) => (a.discount || a.price) - (b.discount || b.price))
      break
    case 'Price: High to Low':
      sorted.sort((a, b) => (b.discount || b.price) - (a.discount || a.price))
      break
    default:
      sorted.sort((a, b) => a.id - b.id)
  }

  products.value = sorted
}

const filterProducts = () => {
  let filtered = [...allProducts.value]

  if (searchQuery.value.trim() !== '') {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(p => p.categoryId === selectedCategory.value)
  }

  products.value = filtered
  sortProducts()
}

const searchProduct = () => {
  filterProducts()
}

const selectCategory = (id) => {
  selectedCategory.value = id
  filterProducts()
}

onMounted(() => {
  readCategory()
  readProduct()
})

watch(sortOption, () => {
  sortProducts()
})

watch(searchQuery, () => {
  filterProducts()
})
</script>

<template>
  <div class="container-fluid my-5">
    <div class="row">
      <!-- Sidebar -->
      <div class="col-lg-3 mb-4">
        <div class="p-3 border rounded shadow-sm bg-white">
          <!-- Search -->
          <h5 class="fw-bold mb-3">Search</h5>
          <form class="input-group mb-3" @submit.prevent>
            <input v-model="searchQuery" type="text" class="form-control" placeholder="Enter product name..." />
            <button type="button" class="btn btn-dark" @click="searchProduct">
              <i class="fa fa-search"></i>
            </button>
          </form>

          <!-- Categories -->
          <h5 class="fw-bold mt-4 mb-3">Product Categories</h5>
          <ul class="list-unstyled sidebar-menu">
            <li>
              <a href="#" class="text-decoration-none text-dark d-block py-2"
                :class="{ 'fw-bold text-primary': selectedCategory === null }" @click.prevent="selectCategory(null)">
                All Products
              </a>
            </li>
            <li v-for="value in category" :key="value.id">
              <a href="#" class="text-decoration-none text-dark d-block py-2"
                :class="{ 'fw-bold text-primary': selectedCategory === value.id }"
                @click.prevent="selectCategory(value.id)">
                {{ value.nameCategory }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Products -->
      <div class="col-lg-9">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <p class="mb-0 text-muted">Showing {{ products.length }} products</p>
          <select v-model="sortOption" class="form-select w-auto">
            <option selected>Default sort</option>
            <option>A -> Z</option>
            <option>Z -> A</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        <div class="row g-4">
          <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="item in products" :key="item.id">
            <router-link :to="`/productDetail/${item.id}`" class="text-decoration-none text-dark">
              <div class="card border-0 shadow-sm h-100">
                <div class="position-relative">
                  <img :src="item.image[0]" class="card-img-top" alt="product" />
                  <span v-if="item.discount < item.price"
                    class="badge bg-danger position-absolute top-0 start-0 m-2 px-2 py-1" style="font-size: 0.8rem;">
                    -{{ Math.round(100 - (item.discount / item.price) * 100) }}%
                  </span>
                </div>

                <div class="card-body text-center">
                  <p class="text-secondary small mb-1">
                    {{category.find(c => c.id === item.categoryId)?.nameCategory || 'No category'}}
                  </p>
                  <h6 class="fw-semibold">{{ item.name }}</h6>

                  <template v-if="item.discount < item.price">
                    <p class="text-muted text-decoration-line-through small mb-1">
                      {{ Number(item.price).toLocaleString('en-US') }} ₫
                    </p>
                    <p class="fw-bold mb-1 text-danger">
                      {{ Number(item.discount).toLocaleString('en-US') }} ₫
                    </p>
                  </template>

                  <template v-else>
                    <p class="fw-bold text-danger mb-0">
                      {{ Number(item.price).toLocaleString('en-US') }} ₫
                    </p>
                  </template>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <p v-if="products.length === 0" class="text-center text-muted mt-4">
          No products found
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-menu li a:hover {
  color: #000;
  font-weight: 500;
}

.card img {
  height: 260px;
  object-fit: cover;
  transition: 0.3s ease;
}

.card:hover img {
  transform: scale(1.05);
}
</style>
