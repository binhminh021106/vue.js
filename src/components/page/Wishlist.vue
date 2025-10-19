<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import Swal from 'sweetalert2';
import { toast } from 'vue3-toastify';
import axios from 'axios';

const router = useRouter();
const store = useStore();

const category = ref([]);

const removeWishlist = async (id) => {
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you really want to remove this product from your wishlist?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:3000/wishlist/${id}`)
                await store.dispatch('fetchWishlist')
                toast.success("The product has been removed from your wishlist.", {
                    autoClose: 3000,
                    position: "top-right",
                });
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Could not remove product.', 'error');
            }
        }
    });
};

onMounted(async () => {
    try {
        await store.dispatch('fetchWishlist');
    } catch {
        router.push("/NotFound");
    }
});
</script>

<template>
    <div class="container py-5">
        <h2 class="fw-bold mb-5 text-center text-uppercase tracking-wide">My Wishlist</h2>

        <div v-if="store.getters.getWishlist.length > 0" class="row g-4 justify-content-center">
            <div class="col-lg-3 col-md-4 col-sm-6" v-for="items in store.getters.getWishlist" :key="items.id">
                <div class="card wishlist-card border-0 rounded-4 shadow-sm overflow-hidden">
                    <router-link :to="`/productDetail/${items.productId}`">
                        <div class="wishlist-img-wrapper position-relative">
                            <img :src="items.image" :alt="items.name" class="wishlist-img" />
                            <span v-if="items.discount < items.price"
                                class="badge discount-badge position-absolute top-0 start-0 m-2 px-2 py-1">
                                -{{ Math.round(100 - (items.discount / items.price) * 100) }}%
                            </span>
                        </div>
                    </router-link>
                    <div class="card-body d-flex flex-column p-3">
                        <h5 class="card-title fw-semibold mb-1 text-truncate text-dark">
                            {{ items.name }}
                        </h5>
                        <template v-if="items.discount < items.price">
                            <p class="text-muted text-decoration-line-through small mb-1">
                                {{ Number(items.price).toLocaleString('vi-VN') }} ₫
                            </p>
                            <p class="fw-bold mb-1 text-danger">
                                {{ Number(items.discount).toLocaleString('vi-VN') }} ₫
                            </p>
                        </template>

                        <div class="mt-auto d-flex gap-2">
                            <router-link :to="`/productDetail/${items.productId}`"
                                class="btn btn-dark flex-grow-1 d-flex align-items-center justify-content-center gap-2">
                                <i class="fa fa-shopping-cart"></i>
                                <span>View Detail</span>
                            </router-link>
                            <button @click="removeWishlist(items.id)"
                                class="btn btn-light border shadow-sm rounded-circle p-2">
                                <i class="fa fa-trash text-danger"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center text-muted mt-5">
            <i class="fa fa-heart-broken fs-1 mb-3"></i>
            <p>Your wishlist is empty. Start adding some favorites!</p>
        </div>
    </div>
</template>

<style scoped>
/* ======= Layout ======= */
.container {
    max-width: 1100px;
}

/* ======= Card ======= */
.wishlist-card {
    background: #fff;
    transition: all 0.3s ease;
    border-radius: 1.2rem;
}

.wishlist-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

/* ======= Image ======= */
.wishlist-img-wrapper {
    height: 230px;
    overflow: hidden;
}

.wishlist-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.wishlist-card:hover .wishlist-img {
    transform: scale(1.07);
}

/* ======= Discount Badge ======= */
.discount-badge {
    background: linear-gradient(45deg, #ff4b2b, #ff416c);
    color: #fff;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
}

/* ======= Buttons ======= */
.btn-dark {
    background: linear-gradient(90deg, #000, #333);
    border: none;
    border-radius: 10px;
    transition: all 0.3s ease;
}

.btn-dark:hover {
    background: linear-gradient(90deg, #333, #000);
    transform: translateY(-2px);
}

.btn-light {
    background: #fff;
    transition: 0.3s ease;
}

.btn-light:hover {
    background: #f8f8f8;
    transform: scale(1.1);
}

/* ======= Empty state ======= */
.text-muted i {
    color: #aaa;
}

.text-muted p {
    font-size: 1.1rem;
}

/* ======= Responsive ======= */
@media (max-width: 768px) {
    .wishlist-img-wrapper {
        height: 180px;
    }

    .card-title {
        font-size: 1rem;
    }
}
</style>
