<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import Swal from 'sweetalert2';

const store = useStore()
const router = useRouter()
const route = useRoute()

const product = computed(() => store.getters.getProduct);
const categories = computed(() => store.getters.getCategories);
const relatedProducts = computed(() => store.getters.getRelatedProducts || []);
const isLoading = computed(() => store.getters.isLoading);

const userQuantity = ref(1);
const isAddingToCart = ref(false);
const isAddingToWishlist = ref(false);

const handleAddToCart = async () => {
    if (!product.value) return;
    isAddingToCart.value = true;
    try {
        await store.dispatch('addToCart', {
            product: product.value,
            quantity: userQuantity.value
        });
        Swal.fire({
            icon: 'success',
            title: 'Added to Cart!',
            text: 'Your product has been added to your cart successfully!',
            confirmButtonText: 'OK',
            confirmButtonColor: '#000',
            timer: 1500,
        });
    } catch (error) {
        if (error.message === "User not logged in") {
            router.push("/login");
        } else {
            Swal.fire('Error', 'Could not add to cart.', 'error');
            console.error(error);
        }
    } finally {
        isAddingToCart.value = false;
    }
};

const handleAddToWishlist = async () => {
    if (!product.value) return;
    isAddingToWishlist.value = true;
    try {
        await store.dispatch('addToWishlist', product.value);
        Swal.fire({
            icon: 'success',
            title: 'Added to Wishlist!',
            timer: 1500,
            showConfirmButton: false,
        });
    } catch (error) {
        if (error.message === "Product already in wishlist") {
            Swal.fire('Info', 'This product is already in your wishlist!', 'info');
        } else if (error.message === "User not logged in") {
            router.push('/login');
        } else {
            Swal.fire('Error', 'Could not add to wishlist.', 'error');
            console.error(error);
        }
    } finally {
        isAddingToWishlist.value = false;
    }
};

const decrease = () => {
    if (userQuantity.value > 1) userQuantity.value--;
};
const increase = () => {
    if (userQuantity.value < 100) userQuantity.value++;
};

watch(() => route.params.id, async (newId) => {
    if (newId) {
        isLoading.value = true;
        await store.dispatch('fetchProductData', newId);
        isLoading.value = false;
        window.scrollTo(0, 0);
    }
}, { immediate: true });

</script>

<template>
    <div v-if="product && product.id" class="container my-5">
        <div class="row g-4">
            <!-- Hình ảnh & thông tin chi tiết -->
            <div class="col-md-6">
                <div class="border rounded p-3 bg-white shadow-sm">
                    <img :src="product.image?.[0] || ''" class="img-fluid w-100 rounded mb-3 main-img" alt="product" />
                    <div class="d-flex gap-2">
                        <img v-for="(img, idx) in product.image ?? []" :key="idx" :src="img"
                            class="img-thumbnail small-img" alt="gallery" />
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="p-3">
                    <h2 class="fw-bold mb-2">{{ product.name }}</h2>

                    <p class="text-muted mb-1">
                        Category:
                        {{categories.find(c => c.id === product.categoryId)?.nameCategory || "Không có"}}
                    </p>

                    <div class="mb-3">
                        <span class="text-muted text-decoration-line-through me-2">
                            {{ Number(product.price).toLocaleString('vi-VN') }} ₫
                        </span>
                        <span class="fw-bold text-danger fs-4">
                            {{ Number(product.discount).toLocaleString('vi-VN') }} ₫
                        </span>
                        <span class="badge bg-success ms-2">
                            -{{ Math.round(100 - (product.discount / product.price) * 100) }}%
                        </span>
                    </div>

                    <p class="text-secondary">
                        Đôi giày huyền thoại mang phong cách cổ điển, chất liệu da cao cấp,
                        đế cao su chống trơn trượt. Phù hợp cho mọi phong cách thời trang.
                    </p>

                    <div class="mt-4">
                        <p class="fw-semibold mb-2">Choose Quantity:</p>
                        <div class="input-group input-group-sm" style="width: 120px;">
                            <button @click="decrease(product)" class="btn btn-outline-dark">-</button>
                            <input v-model="userQuantity" type="number" class="form-control text-center" min="1"
                                max="100" />
                            <button @click="increase(product)" class="btn btn-outline-dark">+</button>
                        </div>
                    </div>

                    <div class="mt-4 d-flex gap-3">
                        <button @click="handleAddToCart" class="btn btn-dark px-4 py-2" :disabled="isAddingToCart">
                            <span v-if="isAddingToCart" class="spinner-border spinner-border-sm" role="status"
                                aria-hidden="true"></span>
                            <i v-else class="fa fa-shopping-cart me-2"></i>
                            {{ isAddingToCart ? 'Adding...' : 'Add to cart' }}
                        </button>
                        <button @click="handleAddToWishlist" class="btn btn-outline-danger px-4 py-2"
                            :disabled="isAddingToWishlist">
                            <span v-if="isAddingToWishlist" class="spinner-border spinner-border-sm" role="status"
                                aria-hidden="true"></span>
                            <i v-else class="fa fa-heart me-2"></i>
                            {{ isAddingToWishlist ? 'Saving...' : 'Favorite' }}
                        </button>
                    </div>

                    <hr class="my-4" />

                    <div>
                        <h5 class="fw-bold mb-2">Description</h5>
                        <p class="text-muted">
                            {{ product.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="related-products mt-5 pt-4 border-top">
            <h4 class="fw-bold mb-4 text-center">Related Products</h4>

            <div v-if="relatedProducts.length > 0" class="row g-4 justify-content-center">
                <div v-for="items in relatedProducts" :key="items.id" class="col-md-3 col-sm-6">
                    <div class="card border-0 shadow-sm rounded-4 overflow-hidden hover-card">
                        <img :src="items.image?.[0] || ''" class="img-fluid w-100 rounded mb-3 main-img"
                            alt="product" />
                        <div class="card-body text-center">
                            <h6 class="fw-semibold mb-1">{{ items.name }}</h6>
                            <p class="text-danger fw-bold mb-2"> {{ Number(items.discount).toLocaleString('vi-VN') }} ₫
                            </p>
                            <router-link :to="`/productDetail/${items.id}`" class="btn btn-outline-dark btn-sm w-100">
                                <i class="fa fa-shopping-cart me-2"></i>View Details
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center text-muted mt-5">No related products</div>
        </div>
    </div>

    <p v-else class="text-center text-muted mt-5">Loading Product...</p>
</template>

<style scoped>
.main-img {
    height: 400px;
    object-fit: cover;
}

.small-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    cursor: pointer;
    transition: 0.3s;
}

.small-img:hover {
    transform: scale(1.05);
    border-color: #000;
}

button.btn-outline-dark:hover {
    background-color: #000;
    color: #fff;
    transition: 0.3s;
}

.related-products {
    background-color: #fafafa;
    padding-bottom: 40px;
    border-radius: 10px;
}

.hover-card {
    transition: all 0.3s ease;
}

.hover-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .main-img {
        height: 300px;
    }
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
