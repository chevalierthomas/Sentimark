<template>
  <section class="company-detail">
    <div v-if="loading" class="state">Loading company insights…</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else-if="snapshot" class="content">
      <header class="overview">
        <div>
          <p class="eyebrow">{{ company.exchange }} • {{ company.country }}</p>
          <h2>
            {{ company.name }}
            <span>({{ company.symbol }})</span>
          </h2>
          <p class="meta">
            <span v-if="company.sector">{{ company.sector }}</span>
            <span v-if="company.industry">· {{ company.industry }}</span>
            <span v-if="company.foundedYear">· Founded {{ company.foundedYear }}</span>
          </p>
          <div class="metrics">
            <div>
              <span class="label">Market Cap</span>
              <strong>{{ formatCurrency(company.marketCap, currencyCode, { notation: 'compact', maximumFractionDigits: 2 }) }}</strong>
            </div>
            <div>
              <span class="label">Employees</span>
              <strong>{{ formatNumber(company.employees) }}</strong>
            </div>
            <div>
              <span class="label">Indices</span>
              <strong>{{ indices.length ? indices.map((index) => index.name).join(', ') : '—' }}</strong>
            </div>
          </div>
          <a
            v-if="company.website"
            class="website"
            :href="company.website"
            target="_blank"
            rel="noopener"
          >
            Visit corporate site ↗
          </a>
        </div>
        <aside class="price" v-if="latestPrice">
          <p class="label">Latest close</p>
          <h3>{{ formatCurrency(latestPrice.close, currencyCode) }}</h3>
          <dl>
            <div>
              <dt>Open</dt>
              <dd>{{ formatCurrency(latestPrice.open, currencyCode) }}</dd>
            </div>
            <div>
              <dt>High</dt>
              <dd>{{ formatCurrency(latestPrice.high, currencyCode) }}</dd>
            </div>
            <div>
              <dt>Low</dt>
              <dd>{{ formatCurrency(latestPrice.low, currencyCode) }}</dd>
            </div>
            <div>
              <dt>Volume</dt>
              <dd>{{ formatNumber(latestPrice.volume) }}</dd>
            </div>
          </dl>
          <p class="timestamp">As of {{ formatDate(latestPrice.timestamp) }}</p>
        </aside>
      </header>

      <section class="panels">
        <article class="panel">
          <header>
            <h3>Recent prices</h3>
            <p>Last {{ priceHistory.length }} data points</p>
          </header>
          <ul v-if="priceHistory.length" class="price-history">
            <li v-for="price in priceHistory" :key="price.timestamp">
              <time :datetime="price.timestamp">{{ formatDate(price.timestamp) }}</time>
              <span>{{ formatCurrency(price.close, price.currency) }}</span>
            </li>
          </ul>
          <p v-else class="empty-state">No price points available.</p>
        </article>

        <article class="panel">
          <header>
            <h3>Financial snapshots</h3>
            <p>Latest reported fiscal years</p>
          </header>
          <ul v-if="financials.length" class="financials">
            <li v-for="row in financials" :key="row.fiscalYear">
              <div>
                <strong>{{ row.fiscalYear }}</strong>
                <span>Revenue {{ formatCurrency(row.revenue, currencyCode) }}</span>
              </div>
              <dl>
                <div>
                  <dt>Net income</dt>
                  <dd>{{ formatCurrency(row.netIncome, currencyCode) }}</dd>
                </div>
                <div>
                  <dt>EPS</dt>
                  <dd>{{ formatNumber(row.eps, 2) }}</dd>
                </div>
                <div>
                  <dt>P/E</dt>
                  <dd>{{ formatNumber(row.peRatio, 2) }}</dd>
                </div>
                <div>
                  <dt>Dividend yield</dt>
                  <dd>{{ formatPercent(row.dividendYield) }}</dd>
                </div>
              </dl>
            </li>
          </ul>
          <p v-else class="empty-state">No financial statements available.</p>
        </article>
      </section>

      <section class="news">
        <header>
          <h3>Latest sentiment reads</h3>
          <p>News coverage pulled from your sample dataset</p>
        </header>
        <ul v-if="newsItems.length" class="news-list">
          <li v-for="item in newsItems" :key="item.id">
            <article>
              <header>
                <p class="source">{{ item.source }} • {{ formatDate(item.publishedAt) }}</p>
                <h4>{{ item.title }}</h4>
              </header>
              <p class="body" v-if="item.content">{{ item.content }}</p>
              <p class="sentiment" :class="{ positive: item.sentiment > 0, negative: item.sentiment < 0 }">
                Sentiment
                <span v-if="item.sentiment != null">
                  {{ item.sentiment > 0 ? '+' : '' }}{{ Number(item.sentiment).toFixed(2) }}
                </span>
                <span v-else>—</span>
              </p>
              <a
                v-if="item.url"
                class="news-link"
                :href="item.url"
                target="_blank"
                rel="noopener"
              >
                Open article ↗
              </a>
            </article>
          </li>
        </ul>
        <p v-else class="empty">No recent articles recorded.</p>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchCompanySnapshot } from '../api/companies';

const route = useRoute();
const router = useRouter();
const snapshot = ref(null);
const loading = ref(true);
const error = ref('');

const company = computed(() => snapshot.value?.company ?? {});
const latestPrice = computed(() => snapshot.value?.latestPrice ?? null);
const currencyCode = computed(() => latestPrice.value?.currency ?? 'USD');
const priceHistory = computed(() => (snapshot.value?.priceHistory ?? []).slice(0, 10));
const financials = computed(() => snapshot.value?.financials ?? []);
const newsItems = computed(() => snapshot.value?.news ?? []);
const indices = computed(() => snapshot.value?.indices ?? []);

const loadSnapshot = async () => {
  loading.value = true;
  error.value = '';
  snapshot.value = null;
  const symbol = route.params.symbol?.toString().toUpperCase();

  try {
    const data = await fetchCompanySnapshot(symbol);
    snapshot.value = data;
  } catch (err) {
    if (err.response?.status === 401) {
      await router.push({ name: 'login', query: { redirect: route.fullPath } });
      return;
    }

    if (err.response?.status === 404) {
      error.value = `We couldn't find data for ${symbol}.`;
    } else {
      error.value = 'Unable to load company insights. Please try again later.';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(loadSnapshot);
watch(
  () => route.params.symbol,
  () => {
    loadSnapshot();
  }
);

const formatNumber = (value, decimals = 0) => {
  if (value == null || Number.isNaN(value)) return '—';
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  });
  return formatter.format(Number(value));
};

const formatCurrency = (value, currency = 'USD', options = {}) => {
  if (value == null || Number.isNaN(value)) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
      ...options
    }).format(Number(value));
  } catch (error) {
    const digits = typeof options.maximumFractionDigits === 'number' ? options.maximumFractionDigits : 2;
    return formatNumber(value, digits);
  }
};

const formatPercent = (value) => {
  if (value == null) return '—';
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return '—';
  return `${(numericValue * 100).toFixed(2)}%`;
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};
</script>

<style scoped>
.company-detail {
  display: grid;
  gap: 2rem;
}

.state {
  padding: 3rem;
  border-radius: 1.5rem;
  background: #fff;
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.12);
  text-align: center;
  font-size: 1.1rem;
  color: #0f172a;
}

.state.error {
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #b91c1c;
}

.content {
  display: grid;
  gap: 2.5rem;
}

.overview {
  display: grid;
  gap: 2rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 64, 175, 0.85));
  color: #e2e8f0;
  padding: 3rem;
  border-radius: 2rem;
  box-shadow: 0 35px 60px rgba(15, 23, 42, 0.35);
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  align-items: start;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: rgba(191, 219, 254, 0.85);
}

.overview h2 {
  margin: 0.5rem 0 0;
  font-size: clamp(2rem, 2.5vw + 1.5rem, 3.25rem);
}

.overview h2 span {
  font-weight: 500;
  font-size: 1.5rem;
  color: rgba(226, 232, 240, 0.9);
}

.meta {
  margin: 0.75rem 0 2rem;
  color: rgba(226, 232, 240, 0.9);
  font-size: 1.05rem;
}

.metrics {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.metrics .label {
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(226, 232, 240, 0.75);
}

.metrics strong {
  display: block;
  margin-top: 0.35rem;
  font-size: 1.2rem;
  color: #f8fafc;
}

.website {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.9);
  color: #ecfeff;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.website:hover {
  transform: translateY(-1px);
  box-shadow: 0 15px 30px rgba(13, 148, 136, 0.45);
}

.price {
  background: rgba(15, 23, 42, 0.45);
  border-radius: 1.5rem;
  padding: 2rem;
  display: grid;
  gap: 1.25rem;
}

.price .label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.75);
  margin: 0;
}

.price h3 {
  margin: 0;
  font-size: 2.5rem;
  color: #facc15;
}

.price dl {
  display: grid;
  gap: 0.5rem;
  margin: 0;
}

.price dl div {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  color: rgba(226, 232, 240, 0.9);
}

.price dt {
  font-weight: 600;
}

.price dd {
  margin: 0;
}

.price .timestamp {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(226, 232, 240, 0.7);
}

.panels {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.panel {
  background: #ffffff;
  border-radius: 1.75rem;
  padding: 2rem;
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(226, 232, 240, 0.6);
  display: grid;
  gap: 1.5rem;
}

.panel header h3 {
  margin: 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.panel header p {
  margin: 0.35rem 0 0;
  color: #475569;
}

.price-history,
.financials {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.85rem;
}

.price-history li,
.financials li {
  display: grid;
  gap: 0.35rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.35);
}

.price-history li:last-child,
.financials li:last-child {
  border-bottom: none;
}

.price-history time {
  font-weight: 600;
  color: #1e293b;
}

.price-history span {
  color: #334155;
}

.financials strong {
  font-size: 1.1rem;
  color: #0f172a;
}

.financials span {
  color: #475569;
  font-size: 0.9rem;
}

.financials dl {
  margin: 0;
  display: grid;
  gap: 0.35rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.financials dt {
  font-weight: 600;
  color: #1e293b;
}

.financials dd {
  margin: 0;
  color: #475569;
}

.empty-state {
  margin: 0;
  color: #64748b;
  font-style: italic;
}

.news {
  background: #ffffff;
  border-radius: 1.75rem;
  padding: 2.5rem;
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(226, 232, 240, 0.6);
  display: grid;
  gap: 1.75rem;
}

.news header h3 {
  margin: 0;
  font-size: 1.45rem;
  color: #0f172a;
}

.news header p {
  margin: 0.35rem 0 0;
  color: #475569;
}

.news-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.5rem;
}

.news-list li {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
}

.news-list li:last-child {
  border-bottom: none;
}

.news article {
  display: grid;
  gap: 0.75rem;
}

.news h4 {
  margin: 0;
  font-size: 1.2rem;
  color: #0f172a;
}

.source {
  margin: 0;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
}

.body {
  margin: 0;
  color: #475569;
}

.sentiment {
  margin: 0;
  font-weight: 600;
  color: #334155;
}

.sentiment.positive {
  color: #0f766e;
}

.sentiment.negative {
  color: #b91c1c;
}

.empty {
  margin: 0;
  color: #475569;
}

.news-link {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.news-link:hover {
  background: rgba(37, 99, 235, 0.2);
  color: #1d4ed8;
}

@media (max-width: 1024px) {
  .overview {
    grid-template-columns: 1fr;
  }
}
</style>
