<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const myWishlist = ref([])

const readWishlist = async () => {
    try {
        const res = await axios.get('http://localhost:3000/wishlist')
        myWishlist.value = res.data
    } catch (err) {
        console.error("Err: ", err)
    }
}

onMounted(readWishlist)
</script>

<template>
    <div class="container py-5">

        <h2 class="fw-bold mb-4 text-center">💖 My Wishlist</h2>
        <div class="row g-4">
            <!-- Product Card -->
            <div class="col-md-4" v-for="items in myWishlist" :key="items.id">
                <div class="card border-0 shadow-sm rounded-4 h-100 product-card">
                    <img :src="items.image" class="card-img-top rounded-top-4" alt="Product Image" />
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-semibold mb-2">
                            {{ items.name }}
                        </h5>
                        <p class="card-text text-muted mb-2">
                            ${{ items.price }}
                        </p>

                        <div class="mt-auto d-flex gap-2">
                            <button class="btn btn-dark w-100">
                                <i class="fa fa-shopping-cart me-2"></i>Add to Cart
                            </button>
                            <button class="btn btn-outline-danger">
                                <i class="fa fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- End Card -->
        </div>
    </div>
</template>

<style scoped>
.product-card img {
    object-fit: cover;
    height: 220px;
    transition: 0.3s ease;
}

.product-card img:hover {
    transform: scale(1.05);
}

.btn {
    border-radius: 10px;
    transition: 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .product-card img {
        height: 180px;
    }

    h5 {
        font-size: 1rem;
    }

    .btn {
        font-size: 0.9rem;
    }
}
</style>
