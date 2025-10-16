<template>
  <section class="company-detail">
    <div v-if="loading" class="state">Loading company insights…</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else-if="snapshot" class="content">
      <header class="overview">
        <div class="identity">
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
          <div class="metric-tags">
            <div class="metric-card">
              <span class="label">Market Cap</span>
              <strong>
                {{
                  formatCurrency(company.marketCap, currencyCode, {
                    notation: 'compact',
                    maximumFractionDigits: 2
                  })
                }}
              </strong>
            </div>
            <div class="metric-card">
              <span class="label">Employees</span>
              <strong>{{ formatNumber(company.employees) }}</strong>
            </div>
            <div class="metric-card">
              <span class="label">Indices</span>
              <strong>{{ indices.length ? indices.map((index) => index.name).join(', ') : '—' }}</strong>
            </div>
          </div>
          <ul v-if="indices.length" class="index-badges">
            <li v-for="index in indices" :key="index.id">{{ index.name }}</li>
          </ul>
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
          <div class="price-header">
            <p class="label">Latest close</p>
            <h3>{{ formatCurrency(latestPrice.close, currencyCode) }}</h3>
            <p v-if="priceTrend" class="price-delta" :class="priceTrend.direction">
              {{ formatSignedCurrency(priceTrend.change, currencyCode) }}
              <span v-if="priceTrend.percent != null">({{ formatSignedPercent(priceTrend.percent) }})</span>
            </p>
          </div>
          <figure v-if="priceSparkline" class="sparkline">
            <svg :viewBox="`0 0 ${priceSparkline.width} ${priceSparkline.height}`" role="img" aria-label="Recent price trend">
              <defs>
                <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="rgba(96, 165, 250, 0.55)" />
                  <stop offset="100%" stop-color="rgba(96, 165, 250, 0)" />
                </linearGradient>
              </defs>
              <path class="area" :d="priceSparkline.area" fill="url(#sparklineGradient)" />
              <path class="line" :d="priceSparkline.path" />
            </svg>
            <figcaption>
              <span>High {{ formatCurrency(priceSparkline.max, currencyCode) }}</span>
              <span>Low {{ formatCurrency(priceSparkline.min, currencyCode) }}</span>
            </figcaption>
          </figure>
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

      <section class="insights-grid">
        <article class="panel price-panel">
          <header>
            <h3>Market pulse</h3>
            <p>Last {{ priceHistory.length }} sessions</p>
          </header>
          <ul v-if="priceHistory.length" class="price-history">
            <li v-for="price in priceHistory" :key="price.timestamp">
              <div class="row">
                <time :datetime="price.timestamp">{{ formatDate(price.timestamp) }}</time>
                <span class="close">{{ formatCurrency(price.close, price.currency) }}</span>
              </div>
              <p class="range">
                <span>High {{ formatCurrency(price.high, price.currency) }}</span>
                <span>Low {{ formatCurrency(price.low, price.currency) }}</span>
              </p>
            </li>
          </ul>
          <p v-else class="empty-state">No price points available.</p>
        </article>

        <article class="panel ratios-panel">
          <header>
            <h3>
              Key ratios
              <span v-if="latestFinancialYear">({{ latestFinancialYear }})</span>
            </h3>
            <p v-if="growthMetrics.length">Year-over-year movement</p>
          </header>
          <div v-if="growthMetrics.length" class="growth-chips">
            <span v-for="metric in growthMetrics" :key="metric.label" class="chip" :class="metric.direction">
              {{ metric.label }}
              <strong>{{ metric.value }}</strong>
            </span>
          </div>
          <ul v-if="ratioHighlights.length" class="ratio-grid">
            <li v-for="ratio in ratioHighlights" :key="ratio.label">
              <span class="label">{{ ratio.label }}</span>
              <strong>{{ ratio.value }}</strong>
            </li>
          </ul>
          <p v-else class="empty-state">No financial ratios available.</p>
        </article>
      </section>

      <section class="financial-timeline">
        <header>
          <h3>Financial timeline</h3>
          <p>Multi-year revenue and profitability snapshots</p>
        </header>
        <ol v-if="financialTimeline.length">
          <li v-for="row in financialTimeline" :key="row.fiscalYear">
            <article>
              <header>
                <h4>{{ row.fiscalYear }}</h4>
                <p>
                  {{ formatCurrency(row.revenue, currencyCode) }} revenue •
                  {{ formatCurrency(row.netIncome, currencyCode) }} net income
                </p>
              </header>
              <div class="bars">
                <div class="bar">
                  <span class="label">Revenue</span>
                  <div class="track">
                    <span class="fill" :style="{ width: `${row.revenueProgress}%` }"></span>
                  </div>
                </div>
                <div class="bar">
                  <span class="label">Net income</span>
                  <div class="track">
                    <span
                      class="fill"
                      :class="{ negative: row.netIncome < 0 }"
                      :style="{ width: `${row.incomeProgress}%` }"
                    ></span>
                  </div>
                </div>
              </div>
              <dl class="financial-metrics">
                <div>
                  <dt>EPS</dt>
                  <dd>{{ formatNumber(row.eps, 2) }}</dd>
                </div>
                <div>
                  <dt>P/E</dt>
                  <dd>{{ row.peRatio != null ? formatNumber(row.peRatio, 2) : '—' }}</dd>
                </div>
                <div>
                  <dt>Dividend yield</dt>
                  <dd>{{ formatPercent(row.dividendYield) }}</dd>
                </div>
                <div>
                  <dt>ROE</dt>
                  <dd>{{ formatPercent(row.roe) }}</dd>
                </div>
                <div>
                  <dt>Debt / equity</dt>
                  <dd>{{ row.debtToEquity != null ? formatNumber(row.debtToEquity, 2) : '—' }}</dd>
                </div>
                <div>
                  <dt>Free cash flow</dt>
                  <dd>
                    {{
                      formatCurrency(row.freeCashFlow, currencyCode, {
                        notation: 'compact',
                        maximumFractionDigits: 2
                      })
                    }}
                  </dd>
                </div>
              </dl>
            </article>
          </li>
        </ol>
        <p v-else class="empty-state">No financial statements available.</p>
      </section>

      <section class="news">
        <header>
          <h3>Latest sentiment reads</h3>
          <p>News coverage pulled from your sample dataset</p>
        </header>
        <ul v-if="newsItems.length" class="news-list">
          <li v-for="item in newsItems" :key="item.id" class="news-card">
            <article>
              <header>
                <p class="source">{{ item.source }} • {{ formatDate(item.publishedAt) }}</p>
                <h4>{{ item.title }}</h4>
              </header>
              <p class="body" v-if="item.content">{{ item.content }}</p>
              <footer>
                <span class="sentiment-chip" :class="sentimentTone(item.sentiment)">
                  Sentiment
                  <strong v-if="item.sentiment != null">{{ formatSignedNumber(item.sentiment, 2) }}</strong>
                  <strong v-else>—</strong>
                </span>
                <a
                  v-if="item.url"
                  class="news-link"
                  :href="item.url"
                  target="_blank"
                  rel="noopener"
                >
                  Read article ↗
                </a>
              </footer>
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

const priceTrend = computed(() => {
  if (priceHistory.value.length < 2) return null;
  const latest = priceHistory.value[0];
  const baseline = priceHistory.value[priceHistory.value.length - 1];
  const latestClose = Number(latest?.close ?? 0);
  const baselineClose = Number(baseline?.close ?? 0);
  const change = latestClose - baselineClose;
  const percent = baselineClose !== 0 ? change / baselineClose : null;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  return { change, percent, direction };
});

const priceSparkline = computed(() => {
  if (!priceHistory.value.length) return null;
  const ordered = [...priceHistory.value].reverse();
  const width = 100;
  const height = 40;
  if (ordered.length === 1) {
    const value = Number(ordered[0]?.close ?? 0);
    return {
      width,
      height,
      path: `M0 ${height / 2} L${width} ${height / 2}`,
      area: `M0 ${height} L${width} ${height} L${width} ${height} L0 ${height} Z`,
      min: value,
      max: value
    };
  }

  const closes = ordered.map((row) => Number(row?.close ?? 0));
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  const points = ordered.map((row, index) => {
    const x = (index / (ordered.length - 1)) * width;
    const value = Number(row?.close ?? 0);
    const y = height - ((value - min) / range) * height;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  });

  const path = points.join(' ');
  const area = `${path} L ${width.toFixed(2)} ${height} L 0 ${height} Z`;

  return {
    width,
    height,
    path,
    area,
    min,
    max
  };
});

const financialTimeline = computed(() => {
  if (!financials.value.length) return [];
  const sorted = [...financials.value].sort((a, b) => b.fiscalYear - a.fiscalYear);
  const revenueValues = sorted.map((row) => Number(row?.revenue ?? 0));
  const incomeValues = sorted.map((row) => Math.abs(Number(row?.netIncome ?? 0)));
  const revenueMax = Math.max(...revenueValues, 0);
  const incomeMax = Math.max(...incomeValues, 0);

  return sorted.map((row) => {
    const revenue = Number(row?.revenue ?? 0);
    const income = Number(row?.netIncome ?? 0);
    const revenueProgress = revenueMax
      ? Math.max(6, (Math.max(revenue, 0) / revenueMax) * 100)
      : 0;
    const incomeProgress = incomeMax
      ? Math.max(6, (Math.abs(income) / incomeMax) * 100)
      : 0;

    return {
      ...row,
      revenueProgress: Number.isFinite(revenueProgress) ? revenueProgress : 0,
      incomeProgress: Number.isFinite(incomeProgress) ? incomeProgress : 0
    };
  });
});

const latestFinancialYear = computed(() => financialTimeline.value[0]?.fiscalYear ?? null);

const ratioHighlights = computed(() => {
  const latest = financialTimeline.value[0];
  if (!latest) return [];

  return [
    { label: 'EPS', value: formatNumber(latest.eps, 2) },
    { label: 'P/E', value: latest.peRatio != null ? formatNumber(latest.peRatio, 2) : '—' },
    { label: 'Dividend yield', value: formatPercent(latest.dividendYield) },
    { label: 'ROE', value: formatPercent(latest.roe) },
    { label: 'Debt / equity', value: latest.debtToEquity != null ? formatNumber(latest.debtToEquity, 2) : '—' },
    {
      label: 'Free cash flow',
      value: formatCurrency(latest.freeCashFlow, currencyCode.value, {
        notation: 'compact',
        maximumFractionDigits: 2
      })
    }
  ];
});

const growthMetrics = computed(() => {
  if (financialTimeline.value.length < 2) return [];
  const [current, previous] = financialTimeline.value;
  const metrics = [];

  const currentRevenue = Number(current?.revenue ?? 0);
  const previousRevenue = Number(previous?.revenue ?? 0);
  if (previousRevenue) {
    const growth = (currentRevenue - previousRevenue) / previousRevenue;
    if (Number.isFinite(growth)) {
      metrics.push({
        label: 'Revenue YoY',
        value: formatSignedPercent(growth),
        direction: growth >= 0 ? 'up' : 'down'
      });
    }
  }

  const currentIncome = Number(current?.netIncome ?? 0);
  const previousIncome = Number(previous?.netIncome ?? 0);
  if (previousIncome) {
    const growth = (currentIncome - previousIncome) / Math.abs(previousIncome);
    if (Number.isFinite(growth)) {
      metrics.push({
        label: 'Net income YoY',
        value: formatSignedPercent(growth),
        direction: growth >= 0 ? 'up' : 'down'
      });
    }
  } else if (previousIncome === 0 && currentIncome !== 0) {
    const delta = currentIncome - previousIncome;
    metrics.push({
      label: 'Net income change',
      value: formatSignedCurrency(delta, currencyCode.value),
      direction: delta >= 0 ? 'up' : 'down'
    });
  }

  const currentFcf = Number(current?.freeCashFlow ?? 0);
  const previousFcf = Number(previous?.freeCashFlow ?? 0);
  if (previousFcf) {
    const growth = (currentFcf - previousFcf) / Math.abs(previousFcf);
    if (Number.isFinite(growth)) {
      metrics.push({
        label: 'Free cash flow YoY',
        value: formatSignedPercent(growth),
        direction: growth >= 0 ? 'up' : 'down'
      });
    }
  } else if (previousFcf === 0 && currentFcf !== 0) {
    const delta = currentFcf - previousFcf;
    metrics.push({
      label: 'Free cash flow change',
      value: formatSignedCurrency(delta, currencyCode.value),
      direction: delta >= 0 ? 'up' : 'down'
    });
  }

  return metrics;
});

const loadSnapshot = async () => {
  loading.value = true;
  error.value = '';
  snapshot.value = null;
  const idParam = route.params.id;
  const companyId = Number.parseInt(idParam, 10);

  if (Number.isNaN(companyId) || companyId <= 0) {
    error.value = 'The requested company could not be identified.';
    loading.value = false;
    return;
  }

  try {
    const data = await fetchCompanySnapshot(companyId);
    snapshot.value = data;
  } catch (err) {
    if (err.response?.status === 401) {
      await router.push({ name: 'login', query: { redirect: route.fullPath } });
      return;
    }

    if (err.response?.status === 404) {
      error.value = `We couldn't find data for company #${companyId}.`;
    } else {
      error.value = 'Unable to load company insights. Please try again later.';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(loadSnapshot);
watch(
  () => route.params.id,
  () => {
    loadSnapshot();
  }
);

function formatNumber(value, decimals = 0) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  });
  return formatter.format(Number(value));
}

function formatSignedNumber(value, decimals = 2) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const numeric = Number(value);
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  });
  const formatted = formatter.format(Math.abs(numeric));
  if (numeric > 0) return `+${formatted}`;
  if (numeric < 0) return `-${formatted}`;
  return formatted;
}

function formatCurrency(value, currency = 'USD', options = {}) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
      ...options
    }).format(Number(value));
  } catch (err) {
    const digits = typeof options.maximumFractionDigits === 'number' ? options.maximumFractionDigits : 2;
    return formatNumber(value, digits);
  }
}

function formatSignedCurrency(value, currency = 'USD') {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const numeric = Number(value);
  const absolute = formatCurrency(Math.abs(numeric), currency);
  if (numeric > 0) return `+${absolute}`;
  if (numeric < 0) return `-${absolute}`;
  return absolute;
}

function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const numericValue = Number(value);
  return `${(numericValue * 100).toFixed(2)}%`;
}

function formatSignedPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const numeric = Number(value);
  const magnitude = Math.abs(numeric * 100).toFixed(2);
  if (numeric > 0) return `+${magnitude}%`;
  if (numeric < 0) return `-${magnitude}%`;
  return `${magnitude}%`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function sentimentTone(value) {
  if (value == null || Number.isNaN(Number(value))) return 'neutral';
  const numeric = Number(value);
  if (numeric > 0.1) return 'positive';
  if (numeric < -0.1) return 'negative';
  return 'neutral';
}
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
  background: radial-gradient(circle at top left, rgba(14, 116, 144, 0.35), transparent 55%),
    linear-gradient(140deg, rgba(15, 23, 42, 0.95), rgba(30, 64, 175, 0.85));
  color: #e2e8f0;
  padding: 3rem;
  border-radius: 2rem;
  box-shadow: 0 35px 60px rgba(15, 23, 42, 0.35);
  grid-template-columns: minmax(0, 2fr) minmax(0, 1.25fr);
  align-items: stretch;
}

.identity {
  display: grid;
  gap: 1.5rem;
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
  margin: 0;
  color: rgba(226, 232, 240, 0.88);
  font-size: 1.05rem;
}

.metric-tags {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.metric-card {
  background: rgba(15, 23, 42, 0.45);
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  display: grid;
  gap: 0.35rem;
  border: 1px solid rgba(148, 163, 184, 0.15);
  backdrop-filter: blur(12px);
}

.metric-card .label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.7);
}

.metric-card strong {
  font-size: 1.25rem;
  color: #f8fafc;
}

.index-badges {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.index-badges li {
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.25);
  color: #e0f2fe;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.website {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.9);
  color: #ecfeff;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.website:hover {
  transform: translateY(-1px);
  box-shadow: 0 15px 30px rgba(16, 185, 129, 0.45);
}

.price {
  background: rgba(15, 23, 42, 0.55);
  border-radius: 1.75rem;
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  align-content: start;
}

.price-header {
  display: grid;
  gap: 0.35rem;
}

.price .label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.7);
  margin: 0;
}

.price h3 {
  margin: 0;
  font-size: 2.75rem;
  color: #facc15;
}

.price-delta {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  font-weight: 600;
  font-size: 1rem;
}

.price-delta.up {
  color: #34d399;
}

.price-delta.down {
  color: #f87171;
}

.price-delta.flat {
  color: #cbd5f5;
}

.price-delta span {
  font-size: 0.85rem;
  opacity: 0.85;
}

.sparkline {
  display: grid;
  gap: 0.5rem;
}

.sparkline svg {
  width: 100%;
  height: auto;
}

.sparkline .line {
  fill: none;
  stroke: rgba(96, 165, 250, 0.95);
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.sparkline figcaption {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.75);
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

.insights-grid {
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

.price-history {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.85rem;
}

.price-history li {
  padding: 0.85rem 1rem;
  border-radius: 1rem;
  background: rgba(241, 245, 249, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.25);
  display: grid;
  gap: 0.35rem;
}

.price-history .row {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: #0f172a;
}

.price-history time {
  font-size: 0.9rem;
}

.price-history .close {
  font-size: 1rem;
}

.price-history .range {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #475569;
}

.ratios-panel .growth-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.ratios-panel .chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: #1e3a8a;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.ratios-panel .chip.up {
  background: rgba(16, 185, 129, 0.15);
  color: #047857;
  border-color: rgba(16, 185, 129, 0.2);
}

.ratios-panel .chip.down {
  background: rgba(248, 113, 113, 0.15);
  color: #b91c1c;
  border-color: rgba(248, 113, 113, 0.2);
}

.ratio-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.ratio-grid li {
  display: grid;
  gap: 0.25rem;
}

.ratio-grid .label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.ratio-grid strong {
  font-size: 1.15rem;
  color: #0f172a;
}

.empty-state {
  margin: 0;
  color: #64748b;
  font-style: italic;
}

.financial-timeline {
  background: #ffffff;
  border-radius: 1.75rem;
  padding: 2.5rem;
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(226, 232, 240, 0.6);
  display: grid;
  gap: 1.75rem;
}

.financial-timeline header h3 {
  margin: 0;
  font-size: 1.45rem;
  color: #0f172a;
}

.financial-timeline header p {
  margin: 0.35rem 0 0;
  color: #475569;
}

.financial-timeline ol {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.5rem;
}

.financial-timeline li article {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(226, 232, 240, 0.75));
  border-radius: 1.5rem;
  padding: 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  display: grid;
  gap: 1.25rem;
}

.financial-timeline li header h4 {
  margin: 0;
  font-size: 1.25rem;
  color: #0f172a;
}

.financial-timeline li header p {
  margin: 0.35rem 0 0;
  color: #475569;
}

.bars {
  display: grid;
  gap: 0.75rem;
}

.bar {
  display: grid;
  gap: 0.35rem;
}

.bar .label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.track {
  position: relative;
  width: 100%;
  height: 0.65rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.25);
  overflow: hidden;
}

.fill {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.9), rgba(30, 64, 175, 0.9));
}

.fill.negative {
  background: linear-gradient(90deg, rgba(248, 113, 113, 0.85), rgba(220, 38, 38, 0.9));
}

.financial-metrics {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.financial-metrics dt {
  font-weight: 600;
  color: #1e293b;
}

.financial-metrics dd {
  margin: 0;
  color: #475569;
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
  gap: 1.75rem;
}

.news-card {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(203, 213, 225, 0.7);
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(226, 232, 240, 0.8));
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
}

.news-card article {
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

.news footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.sentiment-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(148, 163, 184, 0.2);
  color: #1f2937;
}

.sentiment-chip strong {
  font-weight: 700;
}

.sentiment-chip.positive {
  background: rgba(16, 185, 129, 0.15);
  color: #047857;
}

.sentiment-chip.negative {
  background: rgba(248, 113, 113, 0.15);
  color: #b91c1c;
}

.news-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1.1rem;
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

.empty {
  margin: 0;
  color: #475569;
}

@media (max-width: 1024px) {
  .overview {
    grid-template-columns: 1fr;
  }
}
</style>
