<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { toast } from 'vue3-toastify';
import axios from 'axios';
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import ProductDetailSkeleton from './ProductDetailSkeleton.vue';
dayjs.extend(relativeTime)

const API_URL = import.meta.env.VITE_API_BASE_URL;

const store = useStore()
const router = useRouter()
const route = useRoute()
const user = JSON.parse(localStorage.getItem('loggedInUser'))
const comment = ref('')
const product_Comment = ref([])
const replyingTo = ref(null)
const replyText = ref('')

const product = computed(() => store.getters.getProduct);
const categories = computed(() => store.getters.getCategories);
const relatedProducts = computed(() => store.getters.getRelatedProducts || []);
const isLoading = ref(false);

const review = ref([])
const userQuantity = ref(1);
const isAddingToCart = ref(false);
const isAddingToWishlist = ref(false);

const readReview = async () => {
    try {
        const res = await axios.get(`${API_URL}/reviews`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        })
        review.value = res.data.filter(r => r.productId == route.params.id && r.status === "Approved")
    } catch (error) {
        console.error("Err review: ", error)
    }
}

const readComment = async () => {
    try {
        const res = await axios.get(`${API_URL}/comment`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        })
        product_Comment.value = res.data.filter(r => r.productId == route.params.id && r.status === "Approved").map(c => ({
            ...c,
            likes: c.likes || 0,
            liked: c.liked || false,
            product: c.product || ""
        }))
    } catch (err) {
        console.error("Err: ", err)
    }
}


const toggleLike = (comment) => {
    const target = product_Comment.value.find(c => c.id === comment.id)
    if (target) {
        target.liked = !target.liked
        target.likes += target.liked ? 1 : -1
    }
}

const averageRating = computed(() => {
    if (review.value.length === 0) return 0;
    const total = review.value.reduce((sum, r) => sum + (r.rating || 0), 0);
    return (total / review.value.length).toFixed(1);
});

const submitReply = async (parentId) => {
    if (!user || !replyText.value.trim()) return;

    try {
        const res = await axios.post(`${API_URL}/comment`, {
            userId: user.id,
            productId: route.params.id,
            parentId: parentId,
            username: user.fullname,
            imageUser: user.image,
            comment: replyText.value,
            date: new Date(),
            status: "Pending",
        }, {
            headers: { 'ngrok-skip-browser-warning': 'true' },
        });

        product_Comment.value.push(res.data)
        toast.success("Reply submitted!", { autoClose: 2000 });
        replyText.value = "";
        replyingTo.value = null;
    } catch (err) {
        console.error("Err reply:", err);
    }
};

const rootComments = computed(() =>
    product_Comment.value.filter(c => !c.parentId)
)
const repliesOf = (parentId) =>
    product_Comment.value.filter(c => c.parentId === parentId)

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

const submitComment = async () => {
    if (!user || !comment.value.trim()) return;

    try {
        const res = await axios.post(`${API_URL}/comment`, {
            userId: user.id,
            productId: route.params.id,
            username: user.fullname,
            imageUser: user.image,
            comment: comment.value,
            date: new Date(),
            parentId: null,
            status: "Pending",
            product: product.value.name,
            email: user.email
        }, {
            headers: { 'ngrok-skip-browser-warning': 'true' },
        });

        product_Comment.value.push(res.data);
        toast.success("Comment submitted! It will appear after approval.", { autoClose: 2000 });
        comment.value = "";
    } catch (err) {
        console.error("Err comment:", err);
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

onMounted(() => {
    readComment()
    readReview()
})
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
                    <br>

                    <div class="d-flex align-items-center gap-2 mb-2">
                        <span class="badge bg-light text-dark border rounded-pill px-3 py-2 shadow-sm">
                            Available: <strong>{{ product.quantity }}</strong>
                        </span>
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
                        <button v-if="product.quantity > 0" @click="handleAddToCart" class="btn btn-dark px-4 py-2"
                            :disabled="isAddingToCart">
                            <span v-if="isAddingToCart" class="spinner-border spinner-border-sm" role="status"
                                aria-hidden="true"></span>
                            <i v-else class="fa fa-shopping-cart me-2"></i>
                            {{ isAddingToCart ? 'Adding...' : 'Add to cart' }}
                        </button>
                        <button v-else class="btn btn-danger" disabled>Out of stock</button>
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
            <h4 class="fw-bold mb-4 text-center text-uppercase">Customer Reviews</h4>

            <div v-if="review.length > 0" class="review-list">
                <div v-for="value in review" :key="value.id"
                    class="review-item mb-3 p-3 rounded-3 border bg-white shadow-sm">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <h6 class="fw-semibold mb-0">{{ value.username }}</h6>
                        <small class="text-muted">{{ dayjs(value.date).fromNow() }}</small>
                    </div>
                    <div class="rating mb-2">
                        <i v-for="n in 5" :key="n" class="fa fa-star me-1"
                            :class="n <= value.rating ? 'text-warning' : 'text-secondary'"></i>
                    </div>
                    <p class="mb-0 text-muted">{{ value.comment }}</p>
                </div>
            </div>

            <div v-else class="empty-review text-center p-5 rounded bg-white shadow-sm mt-4">
                <i class="fa fa-star text-warning fs-1 mb-3"></i>
                <h6 class="fw-semibold text-dark">No reviews yet</h6>
                <p class="text-muted small mb-0">Be the first to share your experience!</p>
            </div>
        </div>


        <!-- Comments Section -->
        <div class="product-comments mt-5 pt-5 border-top">
            <h4 class="fw-bold mb-4 text-center text-uppercase">Product Comments</h4>

            <!-- Comment Form -->
            <div v-if="user" class="comment-form p-3 rounded shadow-sm bg-white mb-4">
                <div class="d-flex gap-3">
                    <img :src="user.image" class="avatar flex-shrink-0" alt="user" />
                    <div class="flex-grow-1">
                        <textarea v-model="comment" class="form-control rounded-3" rows="3"
                            placeholder="Write your comment here..."></textarea>
                        <div class="text-end mt-2">
                            <button @click="submitComment" class="btn btn-dark px-4 py-2 rounded-3">
                                <i class="fa fa-paper-plane me-2"></i> Submit Comment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center bg-white border rounded-3 p-4 shadow-sm mt-4">
                <i class="fa fa-lock text-muted fs-3 mb-2"></i>
                <p class="text-muted mb-3">Please log in to comment.</p>
                <router-link to="/login" class="btn btn-outline-dark rounded-3 px-4 py-2">
                    <i class="fa fa-sign-in-alt me-2"></i> Log In
                </router-link>
            </div>

            <!-- Comment List -->
            <div class="comment-section mt-5 pt-4 border-top">
                <h4 class="fw-bold mb-4 text-center text-uppercase">Comments</h4>

                <div v-if="rootComments.length > 0" class="comment-list">
                    <!-- Bình luận gốc -->
                    <div v-for="c in rootComments" :key="c.id"
                        class="comment-item d-flex gap-3 align-items-start mb-4 p-3 rounded-4 bg-white border shadow-sm transition">
                        <img :src="c.imageUser" class="avatar flex-shrink-0 rounded-circle border" :alt="c.username"
                            style="width:50px; height:50px; object-fit:cover;" />

                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <h6 class="fw-semibold mb-0 text-dark">{{ c.username }}</h6>
                                <small class="text-muted">{{ dayjs(c.date).fromNow() }}</small>
                            </div>
                            <p class="text-muted mb-2">{{ c.comment }}</p>

                            <!-- Nút hành động -->
                            <div class="d-flex gap-2">
                                <button @click="toggleLike(c)"
                                    class="btn btn-sm rounded-pill py-0 px-3 d-flex align-items-center"
                                    :class="c.liked ? 'btn-primary text-white' : 'btn-outline-primary'">
                                    <i
                                        :class="['fa', c.liked ? 'fa-thumbs-up' : 'fa-regular fa-thumbs-up', 'me-1']"></i>
                                    {{ c.likes || 0 }}
                                </button>
                                <button @click="replyingTo = c.id"
                                    class="btn btn-sm btn-outline-secondary rounded-pill py-0 px-3 d-flex align-items-center">
                                    <i class="fa fa-reply me-1"></i> Reply
                                </button>
                            </div>

                            <!-- Khung trả lời -->
                            <div v-if="replyingTo === c.id" class="reply-box mt-3 ps-5">
                                <div class="p-3 rounded-3 bg-light border">
                                    <textarea v-model="replyText" class="form-control mb-2" rows="2"
                                        placeholder="Write your reply..."></textarea>
                                    <div class="d-flex justify-content-end gap-2">
                                        <button @click="submitReply(c.id)" class="btn btn-dark btn-sm">
                                            Send
                                        </button>
                                        <button @click="replyingTo = null" class="btn btn-outline-secondary btn-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Phản hồi con -->
                            <div v-for="r in repliesOf(c.id)" :key="r.id" class="reply-item mt-3 ps-5">
                                <div
                                    class="d-flex gap-3 align-items-start bg-light rounded-3 p-2 border-start border-3 border-primary shadow-sm">
                                    <img :src="r.imageUser" class="avatar rounded-circle border" alt="reply user"
                                        style="width:40px; height:40px; object-fit:cover;" />
                                    <div>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <h6 class="fw-semibold mb-0">{{ r.username }}</h6>
                                            <small class="text-muted">{{ dayjs(r.date).fromNow() }}</small>
                                        </div>
                                        <p class="text-muted mb-1">{{ r.comment }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="empty-comment text-center p-5 rounded bg-white shadow-sm mt-4">
                    <i class="fa fa-comments text-primary fs-1 mb-3"></i>
                    <h6 class="fw-semibold text-dark">No comments yet</h6>
                    <p class="text-muted small mb-0">Be the first to share your thoughts!</p>
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

    <ProductDetailSkeleton v-else />
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

.review-item {
    transition: all 0.3s ease;
}

.review-item:hover {
    background-color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.empty-review {
    border: 1px dashed #ddd;
    color: #666;
    background-color: #fafafa;
    transition: all 0.2s ease;
}

.empty-review:hover {
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.reply-box {
    border-left: 3px solid #000000;
}

.reply-item {
    background-color: #f9f9f9;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.reply-item:hover {
    background-color: #f1f1f1;
}

.reply-box textarea {
    resize: none;
}

.comment-item {
    border: 1px solid #eee;
    transition: all 0.3s ease;
}

.comment-item:hover {
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
