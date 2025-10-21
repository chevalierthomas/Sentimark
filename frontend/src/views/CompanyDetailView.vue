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
          <div class="stat-grid">
            <div class="stat-card">
              <span class="label">Market cap</span>
              <strong>
                {{
                  formatCurrency(company.marketCap, currencyCode, {
                    notation: 'compact',
                    maximumFractionDigits: 2
                  })
                }}
              </strong>
            </div>
            <div class="stat-card">
              <span class="label">Employees</span>
              <strong>{{ formatNumber(company.employees) }}</strong>
            </div>
            <div class="stat-card" v-if="company.exchange">
              <span class="label">Exchange</span>
              <strong>{{ company.exchange }}</strong>
              <span v-if="latestPrice" class="note">Trades in {{ currencyCode }}</span>
            </div>
            <div class="stat-card" v-if="company.website">
              <span class="label">Website</span>
              <a
                :href="company.website"
                target="_blank"
                rel="noopener"
                class="inline-link"
              >
                Visit site ↗
              </a>
            </div>
          </div>
          <ul v-if="indices.length" class="index-badges">
            <li v-for="index in indices" :key="index.id">{{ index.name }}</li>
          </ul>
        </div>
        <div class="snapshot-grid">
          <article class="snapshot-card price-card" v-if="latestPrice">
            <header>
              <p class="label">Latest close</p>
              <h3>{{ formatCurrency(latestPrice.close, currencyCode) }}</h3>
              <p v-if="priceTrend" class="price-delta" :class="priceTrend.direction">
                {{ formatSignedCurrency(priceTrend.change, currencyCode) }}
                <span v-if="priceTrend.percent != null">({{ formatSignedPercent(priceTrend.percent) }})</span>
              </p>
            </header>
            <figure v-if="priceSparkline" class="sparkline compact">
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
            </figure>
            <dl class="snapshot-stats">
              <div>
                <dt>Day range</dt>
                <dd>
                  {{ formatCurrency(latestPrice.low, currencyCode) }} –
                  {{ formatCurrency(latestPrice.high, currencyCode) }}
                </dd>
              </div>
              <div>
                <dt>Volume</dt>
                <dd>{{ formatNumber(latestPrice.volume) }}</dd>
              </div>
            </dl>
            <p class="timestamp">As of {{ formatDate(latestPrice.timestamp) }}</p>
          </article>
          <article class="snapshot-card" v-if="marketSummary">
            <header>
              <p class="label">Trading span</p>
              <h4>{{ selectedRangeLabel }}</h4>
              <p class="muted">{{ formatDateOnly(marketSummary.start) }} – {{ formatDateOnly(marketSummary.end) }}</p>
            </header>
            <dl class="snapshot-stats">
              <div>
                <dt>Sessions</dt>
                <dd>{{ formatNumber(marketSummary.sessionCount) }}</dd>
                <span class="muted">≈ {{ marketApproxYearsLabel }} yrs</span>
              </div>
              <div>
                <dt>Range</dt>
                <dd>
                  {{ formatCurrency(marketSummary.low, currencyCode) }} –
                  {{ formatCurrency(marketSummary.high, currencyCode) }}
                </dd>
              </div>
              <div>
                <dt>Total return</dt>
                <dd v-if="marketSummary.totalReturn != null" :class="['delta', marketSummary.totalReturn >= 0 ? 'up' : 'down']">
                  {{ formatSignedPercent(marketSummary.totalReturn) }}
                </dd>
                <dd v-else>—</dd>
              </div>
            </dl>
          </article>
          <article class="snapshot-card" v-if="ratioSnapshot.length || growthMetrics.length">
            <header>
              <p class="label">Financial pulse</p>
              <h4>Latest insights</h4>
              <p v-if="latestFinancialYear" class="muted">FY {{ latestFinancialYear }}</p>
            </header>
            <ul v-if="growthMetrics.length" class="chip-stack">
              <li
                v-for="metric in growthMetrics"
                :key="metric.label"
                class="mini-chip"
                :class="metric.direction"
              >
                {{ metric.label }}
                <strong>{{ metric.value }}</strong>
              </li>
            </ul>
            <ul v-if="ratioSnapshot.length" class="snapshot-list">
              <li v-for="ratio in ratioSnapshot" :key="ratio.label">
                <span class="label">{{ ratio.label }}</span>
                <strong>{{ ratio.value }}</strong>
              </li>
            </ul>
          </article>
        </div>
      </header>

      <section class="panel sentiment-panel">
        <header>
          <h3>Sentiment spotlight</h3>
          <p>Stay ahead of the narrative with the latest coverage.</p>
        </header>
        <div v-if="featuredNews" class="sentiment-content">
          <article class="featured-story">
            <p class="source">{{ featuredNews.source }} • {{ formatDate(featuredNews.publishedAt) }}</p>
            <h4>
              <a
                v-if="featuredNews.url"
                :href="featuredNews.url"
                target="_blank"
                rel="noopener"
              >
                {{ featuredNews.title }} ↗
              </a>
              <span v-else>{{ featuredNews.title }}</span>
            </h4>
            <p v-if="featuredNews.content" class="body">{{ featuredNews.content }}</p>
            <span class="sentiment-chip" :class="sentimentTone(featuredNews.sentiment)">
              Sentiment
              <strong v-if="featuredNews.sentiment != null">
                {{ formatSignedNumber(featuredNews.sentiment, 2) }}
              </strong>
              <strong v-else>—</strong>
            </span>
          </article>
          <ul v-if="secondaryNews.length" class="sentiment-feed">
            <li v-for="item in secondaryNews" :key="item.id">
              <article>
                <p class="source">{{ item.source }} • {{ formatDate(item.publishedAt) }}</p>
                <h5>
                  <a
                    v-if="item.url"
                    :href="item.url"
                    target="_blank"
                    rel="noopener"
                  >
                    {{ item.title }} ↗
                  </a>
                  <span v-else>{{ item.title }}</span>
                </h5>
                <footer>
                  <span class="sentiment-chip" :class="sentimentTone(item.sentiment)">
                    <strong v-if="item.sentiment != null">
                      {{ formatSignedNumber(item.sentiment, 2) }}
                    </strong>
                    <strong v-else>—</strong>
                  </span>
                </footer>
              </article>
            </li>
          </ul>
        </div>
        <p v-else class="empty-state">No recent articles recorded.</p>
      </section>

      <section class="insights-grid">
        <article class="panel market-panel">
          <header>
            <h3>Market pulse</h3>
            <p v-if="marketSummary">
              {{ selectedRangeLabel }} • {{ formatNumber(marketSummary.sessionCount) }} sessions
            </p>
            <p v-else>Daily closes will appear here once data is available.</p>
          </header>
          <div v-if="rangeOptions.length && marketChartData" class="market-controls">
            <button
              v-for="option in rangeOptions"
              :key="option.id"
              type="button"
              :class="['range-chip', { active: option.id === selectedRange }]"
              @click="selectRange(option.id)"
              :aria-pressed="option.id === selectedRange"
            >
              {{ option.label }}
            </button>
          </div>
          <div v-if="marketChartData" class="market-chart">
            <Line :data="marketChartData" :options="marketChartOptions" />
          </div>
          <div v-if="marketSummary" class="market-summary">
            <div>
              <span class="label">Span</span>
              <strong>{{ formatDateOnly(marketSummary.start) }} – {{ formatDateOnly(marketSummary.end) }}</strong>
              <p>
                {{ formatNumber(marketSummary.sessionCount) }} sessions (~{{ marketApproxYearsLabel }} yrs)
              </p>
            </div>
            <div>
              <span class="label">Range</span>
              <strong>
                {{ formatCurrency(marketSummary.low, currencyCode) }} –
                {{ formatCurrency(marketSummary.high, currencyCode) }}
              </strong>
              <p>
                From {{ formatCurrency(marketSummary.earliestClose, currencyCode) }} to
                {{ formatCurrency(marketSummary.latestClose, currencyCode) }}
              </p>
            </div>
            <div>
              <span class="label">Average volume</span>
              <strong>{{ formatNumber(marketSummary.averageVolume) }}</strong>
              <p v-if="marketSummary.totalReturn != null">
                Total return
                <span :class="['delta', marketSummary.totalReturn >= 0 ? 'up' : 'down']">
                  {{ formatSignedPercent(marketSummary.totalReturn) }}
                </span>
              </p>
              <p v-else>—</p>
            </div>
          </div>
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

      <section class="panel financial-panel">
        <header>
          <h3>Financial timeline</h3>
          <p>Trendlines for revenue and profitability across fiscal years</p>
        </header>
        <div v-if="financialChartData" class="financial-chart">
          <Bar :data="financialChartData" :options="financialChartOptions" />
        </div>
        <ul v-if="financialTimeline.length" class="financial-cards">
          <li v-for="row in financialTimeline" :key="row.fiscalYear" class="financial-card">
            <article>
              <header>
                <h4>{{ row.fiscalYear }}</h4>
                <p>{{ formatCurrency(row.revenue, currencyCode) }} revenue</p>
              </header>
              <dl>
                <div>
                  <dt>Net income</dt>
                  <dd :class="{ negative: row.netIncome < 0 }">
                    {{ formatCurrency(row.netIncome, currencyCode) }}
                  </dd>
                </div>
                <div>
                  <dt>Free cash flow</dt>
                  <dd :class="{ negative: row.freeCashFlow < 0 }">
                    {{
                      formatCurrency(row.freeCashFlow, currencyCode, {
                        notation: 'compact',
                        maximumFractionDigits: 2
                      })
                    }}
                  </dd>
                </div>
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
              </dl>
            </article>
          </li>
        </ul>
        <p v-else class="empty-state">No financial statements available.</p>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Line, Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { fetchCompanySnapshot } from '../api/companies';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  Tooltip,
  Legend,
  Filler
);

const route = useRoute();
const router = useRouter();
const snapshot = ref(null);
const loading = ref(true);
const error = ref('');

const company = computed(() => snapshot.value?.company ?? {});
const latestPrice = computed(() => snapshot.value?.latestPrice ?? null);
const currencyCode = computed(() => latestPrice.value?.currency ?? 'USD');
const priceHistory = computed(() => snapshot.value?.priceHistory ?? []);
const financials = computed(() => snapshot.value?.financials ?? []);
const newsItems = computed(() => snapshot.value?.news ?? []);
const indices = computed(() => snapshot.value?.indices ?? []);

const featuredNews = computed(() => (newsItems.value.length ? newsItems.value[0] : null));
const secondaryNews = computed(() =>
  newsItems.value.length > 1 ? newsItems.value.slice(1, 5) : []
);

const sparklineWindow = computed(() => priceHistory.value.slice(0, 90));

const rangeOptions = [
  { id: '1M', label: '1M', days: 30 },
  { id: '3M', label: '3M', days: 90 },
  { id: '6M', label: '6M', days: 182 },
  { id: '1Y', label: '1Y', days: 365 },
  { id: '5Y', label: '5Y', days: 365 * 5 },
  { id: 'MAX', label: 'Max', days: null }
];

const selectedRange = ref('1Y');

const marketSeries = computed(() => {
  if (!priceHistory.value.length) return [];
  return [...priceHistory.value].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
});

const selectedRangeOption = computed(() => {
  return (
    rangeOptions.find((option) => option.id === selectedRange.value) ||
    rangeOptions[rangeOptions.length - 1]
  );
});

const filteredMarketSeries = computed(() => {
  if (!marketSeries.value.length) return [];
  const option = selectedRangeOption.value;
  if (!option || option.days == null) {
    return marketSeries.value;
  }

  const end = new Date(marketSeries.value[marketSeries.value.length - 1].timestamp).getTime();
  const start = end - option.days * 24 * 60 * 60 * 1000;

  const filtered = marketSeries.value.filter((row) => {
    const time = new Date(row.timestamp).getTime();
    return Number.isFinite(time) && time >= start;
  });

  return filtered.length ? filtered : marketSeries.value;
});

const selectedRangeLabel = computed(() => {
  const option = selectedRangeOption.value;
  if (!option || option.days == null) {
    return 'Full history';
  }
  if (filteredMarketSeries.value.length === marketSeries.value.length) {
    return 'Full history';
  }
  return `${option.label} range`;
});

const marketChartData = computed(() => {
  if (!filteredMarketSeries.value.length) return null;

  return {
    labels: filteredMarketSeries.value.map((row) => row.timestamp),
    datasets: [
      {
        label: 'Close',
        data: filteredMarketSeries.value.map((row) => Number(row?.close ?? 0)),
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.18)',
        fill: true,
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  };
});

const marketChartOptions = computed(() => {
  const currency = currencyCode.value;

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    elements: { point: { radius: 0, hoverRadius: 3 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        callbacks: {
          title(items) {
            if (!items.length) return '';
            return formatDateOnly(items[0].label);
          },
          label(context) {
            return `Close: ${formatCurrency(context.parsed.y, currency)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: 8,
          color: 'rgba(148, 163, 184, 0.95)',
          callback(value) {
            const label = this.getLabelForValue(value);
            return formatChartTick(label);
          }
        }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.18)', drawBorder: false },
        ticks: {
          color: '#475569',
          callback(value) {
            return formatCurrency(value, currency);
          }
        }
      }
    }
  };
});

const marketSummary = computed(() => {
  if (!filteredMarketSeries.value.length) return null;
  const startRow = filteredMarketSeries.value[0];
  const endRow = filteredMarketSeries.value[filteredMarketSeries.value.length - 1];
  const startDate = new Date(startRow.timestamp);
  const endDate = new Date(endRow.timestamp);
  const diffDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const highs = filteredMarketSeries.value.map((row) => Number(row?.high ?? row?.close ?? 0));
  const lows = filteredMarketSeries.value.map((row) => Number(row?.low ?? row?.close ?? 0));
  const volumes = filteredMarketSeries.value.map((row) => Number(row?.volume ?? 0));
  const latestClose = Number(endRow?.close ?? 0);
  const earliestClose = Number(startRow?.close ?? 0);
  const totalReturn = earliestClose ? (latestClose - earliestClose) / earliestClose : null;
  const volumeTotal = volumes.reduce((sum, value) => sum + value, 0);
  const averageVolume =
    volumes.length && Number.isFinite(volumeTotal) ? volumeTotal / volumes.length : 0;

  return {
    start: startDate,
    end: endDate,
    sessionCount: filteredMarketSeries.value.length,
    approxYears: diffDays / 365,
    high: Math.max(...highs),
    low: Math.min(...lows),
    averageVolume: Math.round(averageVolume),
    latestClose,
    earliestClose,
    totalReturn
  };
});

const marketApproxYearsLabel = computed(() => {
  const summary = marketSummary.value;
  if (!summary) return '';
  return summary.approxYears >= 0.1 ? summary.approxYears.toFixed(1) : '<0.1';
});

const priceTrend = computed(() => {
  if (sparklineWindow.value.length < 2) return null;
  const latest = sparklineWindow.value[0];
  const baseline = sparklineWindow.value[sparklineWindow.value.length - 1];
  const latestClose = Number(latest?.close ?? 0);
  const baselineClose = Number(baseline?.close ?? 0);
  const change = latestClose - baselineClose;
  const percent = baselineClose !== 0 ? change / baselineClose : null;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  return { change, percent, direction };
});

const priceSparkline = computed(() => {
  if (!sparklineWindow.value.length) return null;
  const ordered = [...sparklineWindow.value].reverse();
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
  return [...financials.value].sort((a, b) => b.fiscalYear - a.fiscalYear);
});

const financialSeries = computed(() => {
  if (!financials.value.length) return [];
  return [...financials.value].sort((a, b) => a.fiscalYear - b.fiscalYear);
});

const financialChartData = computed(() => {
  if (!financialSeries.value.length) return null;

  return {
    labels: financialSeries.value.map((row) => row.fiscalYear),
    datasets: [
      {
        label: 'Revenue',
        data: financialSeries.value.map((row) => Number(row?.revenue ?? 0)),
        backgroundColor: 'rgba(56, 189, 248, 0.75)',
        borderRadius: 12,
        borderSkipped: false,
        maxBarThickness: 38
      },
      {
        label: 'Net income',
        data: financialSeries.value.map((row) => Number(row?.netIncome ?? 0)),
        backgroundColor(context) {
          return context.parsed.y >= 0
            ? 'rgba(34, 197, 94, 0.75)'
            : 'rgba(248, 113, 113, 0.75)';
        },
        borderRadius: 12,
        borderSkipped: false,
        maxBarThickness: 38
      }
    ]
  };
});

const financialChartOptions = computed(() => {
  const currency = currencyCode.value;

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#0f172a',
          usePointStyle: true,
          boxWidth: 12,
          font: { weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y, currency)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#475569' }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.2)', drawBorder: false },
        ticks: {
          color: '#475569',
          callback(value) {
            return formatCurrency(value, currency);
          }
        }
      }
    }
  };
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

const ratioSnapshot = computed(() => ratioHighlights.value.slice(0, 3));

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
    selectedRange.value = '1Y';
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

watch(filteredMarketSeries, (series) => {
  if (!series.length && marketSeries.value.length && selectedRange.value !== 'MAX') {
    selectedRange.value = 'MAX';
  }
});

function selectRange(optionId) {
  if (selectedRange.value === optionId) return;
  selectedRange.value = optionId;
}

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

function formatDateOnly(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

function formatChartTick(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
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
  gap: 2rem;
}

.overview {
  display: grid;
  gap: 1.5rem;
  background: radial-gradient(circle at top left, rgba(14, 116, 144, 0.25), transparent 55%),
    linear-gradient(140deg, rgba(15, 23, 42, 0.92), rgba(29, 78, 216, 0.78));
  color: #e2e8f0;
  padding: 2.25rem;
  border-radius: 1.75rem;
  box-shadow: 0 30px 48px rgba(15, 23, 42, 0.32);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: start;
}

.identity {
  display: grid;
  gap: 1.1rem;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.7rem;
  color: rgba(191, 219, 254, 0.75);
}

.overview h2 {
  margin: 0.25rem 0 0;
  font-size: clamp(1.75rem, 2vw + 1.35rem, 2.85rem);
}

.overview h2 span {
  font-weight: 500;
  font-size: 1.25rem;
  color: rgba(226, 232, 240, 0.82);
}

.meta {
  margin: 0;
  color: rgba(226, 232, 240, 0.78);
  font-size: 0.95rem;
}

.stat-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.stat-card {
  background: rgba(15, 23, 42, 0.48);
  border-radius: 1rem;
  padding: 0.9rem 1.1rem;
  display: grid;
  gap: 0.3rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  backdrop-filter: blur(10px);
}

.stat-card .label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.7rem;
  color: rgba(226, 232, 240, 0.68);
}

.stat-card strong {
  font-size: 1.1rem;
  color: #f8fafc;
}

.stat-card .note {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(191, 219, 254, 0.75);
}

.inline-link {
  color: #bfdbfe;
  font-weight: 600;
  text-decoration: none;
}

.inline-link:hover {
  text-decoration: underline;
}

.index-badges {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.index-badges li {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.28);
  color: #e0f2fe;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.snapshot-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.snapshot-card {
  display: grid;
  gap: 0.9rem;
  padding: 1.35rem;
  border-radius: 1.25rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.24);
  color: #e2e8f0;
}

.snapshot-card header {
  display: grid;
  gap: 0.35rem;
}

.snapshot-card header .label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.7rem;
  color: rgba(148, 163, 184, 0.8);
}

.snapshot-card h3,
.snapshot-card h4 {
  margin: 0;
  font-size: 1.45rem;
  color: #f8fafc;
}

.snapshot-card .muted {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(191, 219, 254, 0.75);
}

.price-card {
  background: linear-gradient(160deg, rgba(96, 165, 250, 0.25), transparent 85%),
    rgba(15, 23, 42, 0.55);
  border-color: rgba(96, 165, 250, 0.45);
}

.price-delta {
  margin: 0;
  font-weight: 600;
  font-size: 0.95rem;
}

.price-delta.up {
  color: #4ade80;
}

.price-delta.down {
  color: #f87171;
}

.price-delta.flat {
  color: #e2e8f0;
}

.price-delta span {
  font-size: 0.8rem;
  opacity: 0.85;
}

.sparkline {
  display: grid;
  gap: 0.4rem;
}

.sparkline svg {
  width: 100%;
  height: 72px;
}

.sparkline.compact svg {
  height: 64px;
}

.sparkline .line {
  fill: none;
  stroke: rgba(96, 165, 250, 0.95);
  stroke-width: 2.2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.sparkline .area {
  stroke: none;
}

.snapshot-stats {
  display: grid;
  gap: 0.75rem;
}

.snapshot-stats div {
  display: grid;
  gap: 0.15rem;
}

.snapshot-stats dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(191, 219, 254, 0.7);
}

.snapshot-stats dd {
  margin: 0;
  font-size: 0.95rem;
  color: #f8fafc;
  font-weight: 600;
}

.snapshot-stats .muted {
  font-weight: 500;
}

.snapshot-card .timestamp {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(191, 219, 254, 0.7);
}

.chip-stack {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.mini-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.16);
  color: #dbeafe;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.mini-chip.up {
  background: rgba(34, 197, 94, 0.18);
  color: #bbf7d0;
  border-color: rgba(34, 197, 94, 0.3);
}

.mini-chip.down {
  background: rgba(248, 113, 113, 0.18);
  color: #fee2e2;
  border-color: rgba(248, 113, 113, 0.28);
}

.snapshot-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}

.snapshot-list li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.snapshot-list .label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.7rem;
  color: rgba(191, 219, 254, 0.7);
}


.insights-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.panel {
  background: #ffffff;
  border-radius: 1.5rem;
  padding: 1.75rem;
  box-shadow: 0 22px 40px rgba(15, 23, 42, 0.1);
  border: 1px solid rgba(226, 232, 240, 0.55);
  display: grid;
  gap: 1.25rem;
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

.market-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.range-chip {
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: #ffffff;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.range-chip:hover {
  border-color: rgba(59, 130, 246, 0.4);
}

.range-chip.active {
  background: rgba(37, 99, 235, 0.12);
  border-color: rgba(37, 99, 235, 0.4);
  color: #1d4ed8;
}

.market-chart {
  height: 280px;
  background: linear-gradient(180deg, rgba(226, 232, 240, 0.4), rgba(248, 250, 252, 0.85));
  border-radius: 1.2rem;
  padding: 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  overflow: hidden;
}

.market-chart :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}

.market-summary {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  background: rgba(248, 250, 252, 0.85);
  border-radius: 1.2rem;
  border: 1px solid rgba(148, 163, 184, 0.16);
  padding: 1rem;
}

.market-summary > div {
  display: grid;
  gap: 0.35rem;
}

.market-summary .label {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: #64748b;
}

.market-summary strong {
  font-size: 1.1rem;
  color: #0f172a;
}

.market-summary p {
  margin: 0;
  color: #475569;
  font-size: 0.85rem;
}

.market-summary .delta {
  margin-left: 0.25rem;
  font-weight: 600;
}

.market-summary .delta.up {
  color: #16a34a;
}

.market-summary .delta.down {
  color: #dc2626;
}

@media (max-width: 768px) {
  .market-chart {
    height: 220px;
    padding: 0.75rem;
  }

  .financial-chart {
    height: 180px;
    padding: 0.75rem;
  }

  .financial-card dl {
    grid-template-columns: 1fr;
  }

  .sentiment-content {
    grid-template-columns: 1fr;
  }
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

.financial-panel {
  background: #ffffff;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 20px 38px rgba(15, 23, 42, 0.1);
  border: 1px solid rgba(226, 232, 240, 0.5);
  display: grid;
  gap: 1.1rem;
}

.financial-panel header h3 {
  margin: 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.financial-panel header p {
  margin: 0.25rem 0 0;
  color: #475569;
}

.financial-chart {
  height: 200px;
  background: linear-gradient(180deg, rgba(226, 232, 240, 0.45), rgba(248, 250, 252, 0.9));
  border-radius: 1.35rem;
  padding: 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  overflow: hidden;
}

.financial-chart :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}

.financial-cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(200px, 1fr);
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.35rem;
  scrollbar-width: thin;
  align-items: stretch;
}

.financial-cards::-webkit-scrollbar {
  height: 6px;
}

.financial-cards::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.4);
  border-radius: 999px;
}

.financial-card article {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(226, 232, 240, 0.78));
  border-radius: 1.25rem;
  padding: 1.15rem;
  border: 1px solid rgba(203, 213, 225, 0.5);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 0.85rem;
  min-height: 100%;
}

.financial-card header h4 {
  margin: 0;
  font-size: 1.2rem;
  color: #0f172a;
}

.financial-card header p {
  margin: 0.25rem 0 0;
  color: #475569;
}

.financial-card dl {
  margin: 0;
  display: grid;
  gap: 0.55rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.financial-card dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.financial-card dd {
  margin: 0.1rem 0 0;
  font-weight: 600;
  color: #0f172a;
}

.financial-card dd.negative {
  color: #b91c1c;
}

.sentiment-panel {
  background: linear-gradient(140deg, rgba(30, 64, 175, 0.1), rgba(15, 118, 110, 0.05));
  border: 1px solid rgba(148, 163, 184, 0.32);
  box-shadow: 0 20px 38px rgba(15, 23, 42, 0.1);
  align-content: start;
}

.sentiment-content {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1.1fr);
  align-items: stretch;
}

.featured-story {
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.9), rgba(30, 58, 138, 0.75));
  color: #e2e8f0;
  border-radius: 1.35rem;
  padding: 1.5rem;
  border: 1px solid rgba(96, 165, 250, 0.32);
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.2);
  display: grid;
  gap: 0.85rem;
}

.featured-story h4 {
  margin: 0;
  font-size: 1.45rem;
  line-height: 1.3;
}

.featured-story h4 a {
  color: inherit;
  text-decoration: none;
}

.featured-story h4 a:hover {
  text-decoration: underline;
}

.featured-story .body {
  margin: 0;
  color: rgba(226, 232, 240, 0.9);
}

.sentiment-feed {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.9rem;
}

.sentiment-feed li article {
  border-radius: 1.15rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  padding: 1.1rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(6px);
  display: grid;
  gap: 0.65rem;
}

.sentiment-feed h5 {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
}

.sentiment-feed h5 a {
  color: inherit;
  text-decoration: none;
}

.sentiment-feed h5 a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.source {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(30, 64, 175, 0.75);
}

.body {
  margin: 0;
  color: #475569;
}

.sentiment-panel footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
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

@media (max-width: 1024px) {
  .overview {
    grid-template-columns: 1fr;
  }

  .sentiment-content {
    grid-template-columns: 1fr;
  }
}
</style>
