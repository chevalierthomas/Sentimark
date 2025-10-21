<template>
  <section class="welcome">
    <div class="hero">
      <p class="eyebrow">Market Sentiment Intelligence</p>
      <h2>Discover how investors feel about the companies you follow in real time.</h2>
      <p class="subtitle">
        Start by searching for a company, index, or ETF to reveal news coverage, social media
        activity, and AI-driven sentiment insights tailored for informed decision-making.
      </p>
      <SearchBar @select="onSelection" />
      <Transition name="fade">
        <div v-if="selection" class="selection-result">
          <p>
            Searching for <strong>{{ selection.query }}</strong>.
          </p>
          <RouterLink class="cta" :to="{ name: 'login' }">
            Sign in to view sentiment dashboards
          </RouterLink>
        </div>
      </Transition>
    </div>
    <aside class="panel">
      <h3>Why Sentimark?</h3>
      <ul>
        <li>
          <span class="badge">AI</span>
          <div>
            <h4>Adaptive sentiment scoring</h4>
            <p>Blend news, earnings, and social data streams to monitor mood swings instantly.</p>
          </div>
        </li>
        <li>
          <span class="badge">Alerts</span>
          <div>
            <h4>Risk-aware notifications</h4>
            <p>Receive proactive alerts when sentiment diverges from price action.</p>
          </div>
        </li>
        <li>
          <span class="badge">Team</span>
          <div>
            <h4>Collaboration ready</h4>
            <p>Share watchlists and insights with your team in a secure workspace.</p>
          </div>
        </li>
      </ul>
    </aside>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import SearchBar from '../components/SearchBar.vue';
import { useAuth } from '../stores/auth';

const selection = ref(null);
const router = useRouter();
const auth = useAuth();

const onSelection = (result) => {
  if (result?.id != null) {
    const destination = { name: 'company-detail', params: { id: result.id } };
    const resolved = router.resolve(destination);
    selection.value = null;
    if (auth.isAuthenticated.value) {
      router.push(destination);
    } else {
      router.push({ name: 'login', query: { redirect: resolved.href } });
    }
    return;
  }

  selection.value = result;
};

</script>

<style scoped>
.welcome {
  display: grid;
  gap: 3rem;
  grid-template-columns: 2fr 1fr;
  align-items: start;
}

.hero {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 64, 175, 0.85));
  padding: 3.5rem;
  border-radius: 2.5rem;
  color: #e2e8f0;
  box-shadow: 0 35px 60px rgba(15, 23, 42, 0.35);
}

.eyebrow {
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: rgba(191, 219, 254, 0.9);
  margin-bottom: 1rem;
}

.hero h2 {
  font-size: clamp(2rem, 3vw + 1rem, 3.25rem);
  margin: 0 0 1rem;
  color: #f8fafc;
}

.subtitle {
  margin: 0 0 2.5rem;
  max-width: 60ch;
  color: rgba(226, 232, 240, 0.9);
  font-size: 1.05rem;
}

.selection-result {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: grid;
  gap: 0.75rem;
}

.selection-result p {
  margin: 0;
  font-size: 1.1rem;
}

.cta {
  justify-self: start;
  padding: 0.85rem 1.75rem;
  border-radius: 999px;
  background: #f97316;
  color: #0f172a;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.85rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 15px 30px rgba(249, 115, 22, 0.35);
}

.panel {
  background: #ffffff;
  border-radius: 2.5rem;
  padding: 2.5rem;
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(226, 232, 240, 0.6);
}

.panel h3 {
  margin-top: 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.panel ul {
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
  display: grid;
  gap: 1.75rem;
}

.panel li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: start;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1.5rem;
  background: #312e81;
  color: #c7d2fe;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .welcome {
    grid-template-columns: 1fr;
  }
}
</style>
