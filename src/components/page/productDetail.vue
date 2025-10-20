<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { toast } from 'vue3-toastify';
import axios from 'axios';
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const store = useStore()
const router = useRouter()
const route = useRoute()

const product = computed(() => store.getters.getProduct);
const categories = computed(() => store.getters.getCategories);
const relatedProducts = computed(() => store.getters.getRelatedProducts || []);
const isLoading = computed(() => store.getters.isLoading);

const review = ref([])
const userQuantity = ref(1);
const isAddingToCart = ref(false);
const isAddingToWishlist = ref(false);

const readReview = async () => {
    try {
        const res = await axios.get('http://localhost:3000/reviews')
        review.value = res.data.filter(r => r.productId == route.params.id)
    } catch (error) {
        console.error("Err review: ", error)
    }
}

const averageRating = computed(() => {
    if (review.value.length === 0) return 0;
    const total = review.value.reduce((sum, r) => sum + (r.rating || 0), 0);
    return (total / review.value.length).toFixed(1);
});

const totalReviews = computed(() => review.value.length);

const getStarClass = (n) => {
    const rating = parseFloat(averageRating.value)
    if (n <= Math.floor(rating)) {
        return "fa-solid fa-star text-warning"
    } else if (n - rating <= 0.5) {
        return "fa-solid fa-star-half-stroke text-warning"
    } else {
        return "fa-regular fa-star text-secondary"
    }
}



const handleAddToCart = async () => {
    if (!product.value) return;
    isAddingToCart.value = true;
    try {
        await store.dispatch('addToCart', {
            product: product.value,
            quantity: userQuantity.value
        });
        toast.success("Product added to cart", {
            autoClose: 3000,
            position: "top-right",
        });
    } catch (error) {
        if (error.message === "User not logged in") {
            router.push("/login");
        } else {
            toast.error("Could not add to cart.", {
                autoClose: 3000,
                position: "top-right",
            });
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
        toast.success("Added to Wishlist!", {
            autoClose: 3000,
            position: "top-right",
        });
    } catch (error) {
        if (error.message === "Product already in wishlist") {
            toast.error("This product is already in your wishlist!", {
                autoClose: 3000,
                position: "top-right",
            });
        } else if (error.message === "User not logged in") {
            router.push('/login');
        } else {
            toast.error("Could not add to wishlist.", {
                autoClose: 3000,
                position: "top-right",
            });
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

onMounted(readReview)
</script>

<template>
    <div v-if="product && product.id" class="container my-5">
        <div class="row g-4">
            <!-- Hình ảnh & thông tin chi tiết -->
            <div class="col-md-6">
                <div class="border rounded p-3 bg-white shadow-sm">
                    <img :src="product.image?.[0] || ''" class="img-fluid w-100 rounded mb-3 main-img" alt="product" />
                    <div class="d-flex gap-2 flex-wrap">
                        <img v-for="(img, idx) in product.image ?? []" :key="idx" :src="img"
                            class="img-thumbnail small-img" alt="gallery" />
                    </div>
                </div>
            </div>

            <!-- Thông tin sản phẩm -->
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

                    <div class="mt-3">
                        <div class="rating d-flex align-items-center gap-1 mb-2">
                            <i v-for="n in 5" :key="n" class="fa" :class="getStarClass(n)"></i>
                        </div>

                        <small class="text-muted">
                            {{ averageRating }}/5.0 based on {{ totalReviews }} reviews
                        </small>
                    </div>


                    <div class="mt-4">
                        <p class="fw-semibold mb-2">Choose Quantity:</p>
                        <div class="input-group input-group-sm" style="width: 120px;">
                            <button @click="decrease(product)" class="btn btn-outline-dark">-</button>
                            <input v-model="userQuantity" type="number" class="form-control text-center" min="1"
                                max="100" />
                            <button @click="increase(product)" class="btn btn-outline-dark">+</button>
                        </div>
                    </div>

                    <div class="mt-4 d-flex gap-3 flex-wrap">
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
                        <p class="text-muted">{{ product.description }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="reviews-section mt-5 pt-4 border-top">
            <h4 class="fw-bold mb-4">Customer Reviews</h4>
            <div v-if="review.length > 0" class="review-list">
                <div v-for="value in review" :key="value.id" class="review-item mb-3 p-3 rounded border bg-light">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="fw-semibold mb-1">{{ value.username }}</h6>
                        <small class="text-muted">{{ dayjs(value.date).fromNow() }}</small>
                    </div>
                    <div class="rating mb-2">
                        <i v-for="n in 5" :key="n" class="fa fa-star me-1"
                            :class="n <= value.rating ? 'text-warning' : 'text-secondary'"></i>
                    </div>
                    <p class="mb-0 text-muted">{{ value.comment }}</p>
                </div>
            </div>
            <div v-else class="text-center text-muted mt-5">No reviews yet</div>
        </div>

        <!-- Comments Section -->
        <div class="product-comments mt-5 pt-5 border-top">
            <h4 class="fw-bold mb-4 text-center text-uppercase">Product Comments</h4>

            <!-- Comment Form -->
            <div class="comment-form p-3 rounded shadow-sm bg-white mb-4">
                <div class="d-flex gap-3">
                    <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" class="avatar flex-shrink-0"
                        alt="user" />
                    <div class="flex-grow-1">
                        <textarea class="form-control rounded-3" rows="3"
                            placeholder="Write your comment here..."></textarea>
                        <div class="text-end mt-2">
                            <button class="btn btn-dark px-4 py-2 rounded-3">
                                <i class="fa fa-paper-plane me-2"></i> Submit Comment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Comment List -->
            <div class="comment-list">
                <div v-for="i in 3" :key="i"
                    class="comment-item d-flex gap-3 align-items-start mb-4 p-3 rounded-4 shadow-sm bg-light">
                    <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" class="avatar flex-shrink-0"
                        alt="user" />
                    <div>
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <h6 class="fw-bold mb-0">User {{ i }}</h6>
                            <small class="text-muted">2 hours ago</small>
                        </div>
                        <p class="text-muted small mb-1">
                            Sample comment number {{ i }} for this product 😁
                        </p>
                        <div class="d-flex gap-2 mt-1">
                            <button class="btn btn-sm btn-outline-secondary rounded-pill py-0 px-3">
                                <i class="fa fa-thumbs-up me-1"></i> Like
                            </button>
                            <button class="btn btn-sm btn-outline-secondary rounded-pill py-0 px-3">
                                <i class="fa fa-reply me-1"></i> Reply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <!-- Sản phẩm liên quan -->
        <div class="related-products mt-5 pt-4 border-top">
            <h4 class="fw-bold mb-4 text-center">Related Products</h4>

            <div v-if="relatedProducts.length > 0" class="row g-3 justify-content-center">
                <div v-for="items in relatedProducts" :key="items.id" class="col-lg-2 col-md-3 col-6">
                    <div class="card border-0 shadow-sm rounded-4 overflow-hidden hover-card">
                        <img :src="items.image?.[0] || ''" class="img-fluid w-100 related-img" alt="product" />
                        <div class="card-body text-center p-2">
                            <h6 class="fw-semibold small mb-1 text-truncate">{{ items.name }}</h6>
                            <p class="text-danger fw-bold mb-2 small">{{ Number(items.discount).toLocaleString('vi-VN')
                            }} ₫</p>
                            <router-link :to="`/productDetail/${items.id}`" class="btn btn-outline-dark btn-sm w-100">
                                <i class="fa fa-eye me-2"></i>View
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
    width: 70px;
    height: 70px;
    object-fit: cover;
    cursor: pointer;
    transition: 0.3s;
    border-radius: 6px;
}

.small-img:hover {
    transform: scale(1.05);
    border-color: #000;
}

.related-products {
    background-color: #fafafa;
    padding-bottom: 30px;
    border-radius: 10px;
}

.related-img {
    height: 160px;
    object-fit: cover;
    border-bottom: 1px solid #eee;
}

.hover-card {
    transition: all 0.3s ease;
}

.product-comments {
    background-color: #fafafa;
    border-radius: 10px;
    padding: 30px;
}

.avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
}

.comment-form textarea {
    resize: none;
    background-color: #f9f9f9;
}

.comment-item {
    transition: all 0.3s ease;
    border: 1px solid #eee;
}

.comment-item:hover {
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.comment-list {
    max-height: 400px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #ccc transparent;
}

/* Custom scroll bar */
.comment-list::-webkit-scrollbar {
    width: 6px;
}

.comment-list::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 6px;
}

.comment-list::-webkit-scrollbar-thumb:hover {
    background-color: #999;
}

@media (max-width: 768px) {
    .product-comments {
        padding: 20px;
    }
}


.hover-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.rating i {
    font-size: 1.2rem;
}

@media (max-width: 768px) {
    .main-img {
        height: 300px;
    }

    .related-img {
        height: 130px;
    }
}
</style>
