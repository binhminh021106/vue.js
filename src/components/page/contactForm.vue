<script>
import axios from "axios";

export default {
  data() {
    return {
      emailData: {
        to: "minhdzwama211@gmail.com", 
        from: "", 
        subject: "",
        text: ""
      },
      isSending: false,
      statusMessage: "",
    };
  },
  methods: {
    async sendEmail() {
      if (!this.emailData.from) {
          alert('Error: Your email is missing. Please log in again.');
          return;
      }

      this.isSending = true;
      this.statusMessage = "Sending email...";

      const payload = {
        to: this.emailData.to,
        subject: this.emailData.subject,
        text: `From: ${this.emailData.from}\n\nMessage:\n${this.emailData.text}`
      };

      try {
        const res = await axios.post("http://localhost:3001/send-email", payload);
        this.statusMessage = res.data;
        
        this.emailData.subject = "";
        this.emailData.text = "";

      } catch (err) {
        this.statusMessage = "❌ Failed to send email. Please try again.";
      } finally {
        this.isSending = false;
      }
    },
  },

  mounted() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (loggedInUser && loggedInUser.email) {
      this.emailData.from = loggedInUser.email;
    } else {
      alert('You are not logged in. Redirecting to login page.');
      window.location.href = '/login'; 
    }
  }
};
</script>

<template>
    <div class="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div class="row w-100 mx-0 d-flex align-items-center justify-content-center">

            <!-- Left Column -->
            <div class="col-md-4 text-center mb-4 mb-md-0">
                <h2 class="fw-bold mb-3">Contact Us</h2>
                <p class="text-muted px-4">
                    Have a question or want to collaborate?
                    Send us an email and we’ll get back to you as soon as possible.
                </p>
                <img src="https://cdn-icons-png.flaticon.com/512/732/732200.png" alt="Email icon" class="img-fluid mt-3"
                    style="max-width: 120px;" />
            </div>

            <!-- Center Column (Form) -->
            <div class="col-md-4">
                <div class="card shadow p-4" style="border-radius: 12px;">
                    <h3 class="text-center mb-4 fw-bold">Contact Us</h3>

                    <form @submit.prevent="sendEmail">
                        <div class="mb-3 text-start">
                            <label class="form-label fw-semibold">Your Email</label>
                            <input type="email" class="form-control" v-model="emailData.from"
                                placeholder="Enter your email" required />
                        </div>

                        <div class="mb-3 text-start">
                            <label class="form-label fw-semibold">Subject</label>
                            <input type="text" class="form-control" v-model="emailData.subject"
                                placeholder="Enter email subject" required />
                        </div>

                        <div class="mb-3 text-start">
                            <label class="form-label fw-semibold">Message</label>
                            <textarea class="form-control" rows="4" v-model="emailData.text"
                                placeholder="Write your message here..." required></textarea>
                        </div>

                        <button type="submit" class="btn btn-dark w-100 fw-semibold" :disabled="isSending">
                            {{ isSending ? "Sending..." : "Send Email" }}
                        </button>
                    </form>

                    <p v-if="statusMessage" class="text-center mt-3 text-muted small">
                        {{ statusMessage }}
                    </p>
                </div>
            </div>

            <!-- Right Column -->
            <div class="col-md-4 text-center">
                <img src="https://cdn-icons-png.flaticon.com/512/906/906175.png" alt="Illustration" class="img-fluid"
                    style="max-width: 280px;" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.form-control:focus {
    border-color: #000;
    box-shadow: 0 0 0 0.2rem rgba(0, 0, 0, 0.1);
}

.card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}
</style>
