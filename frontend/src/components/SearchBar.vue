<template>
  <div class="search-bar">
    <label class="search-label" for="company-search">Find a company</label>
    <div class="input-wrapper" ref="wrapperRef">
      <input
        id="company-search"
        v-model="query"
        type="search"
        :placeholder="placeholder"
        autocomplete="off"
        @focus="showSuggestions = true"
        @input="onInput"
        @keydown.down.prevent="onArrowDown"
        @keydown.up.prevent="onArrowUp"
        @keydown.enter.prevent="onEnter"
      />
      <button type="button" class="search-action" @click="emitSelection">
        Search
      </button>
      <ul v-if="showSuggestions && suggestions.length" class="suggestions">
        <li
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.symbol"
          :class="{ active: highlightedIndex === index }"
          @mousedown.prevent="selectSuggestion(suggestion)"
        >
          <span class="suggestion-symbol">{{ suggestion.symbol }}</span>
          <span class="suggestion-name">{{ suggestion.name }}</span>
        </li>
      </ul>
      <p v-else-if="showSuggestions && !loading && !suggestions.length" class="empty-state">
        No companies found.
      </p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { fetchCompanies } from '../api/companies';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search by company name or ticker'
  }
});

const emit = defineEmits(['select']);

const query = ref('');
const suggestions = ref([]);
const loading = ref(false);
const error = ref('');
const showSuggestions = ref(false);
const highlightedIndex = ref(-1);
const wrapperRef = ref(null);
let debounceTimeout;

const fetchSuggestions = async () => {
  loading.value = true;
  error.value = '';
  try {
    const results = await fetchCompanies(query.value.trim());
    suggestions.value = results;
    highlightedIndex.value = -1;
  } catch (err) {
    error.value = 'Unable to load companies. Please try again.';
  } finally {
    loading.value = false;
  }
};

const onInput = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (query.value.trim().length < 1) {
      suggestions.value = [];
      return;
    }
    fetchSuggestions();
  }, 250);
};

const onArrowDown = () => {
  if (!suggestions.value.length) return;
  highlightedIndex.value = (highlightedIndex.value + 1) % suggestions.value.length;
};

const onArrowUp = () => {
  if (!suggestions.value.length) return;
  highlightedIndex.value =
    highlightedIndex.value <= 0 ? suggestions.value.length - 1 : highlightedIndex.value - 1;
};

const onEnter = () => {
  if (highlightedIndex.value >= 0) {
    selectSuggestion(suggestions.value[highlightedIndex.value]);
  } else {
    emitSelection();
  }
};

const selectSuggestion = (suggestion) => {
  query.value = `${suggestion.symbol} — ${suggestion.name}`;
  emit('select', suggestion);
  showSuggestions.value = false;
};

const emitSelection = () => {
  if (!query.value.trim()) return;
  emit('select', { query: query.value.trim() });
  showSuggestions.value = false;
};

const onClickOutside = (event) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    showSuggestions.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
  clearTimeout(debounceTimeout);
});

watch(
  () => query.value,
  (value) => {
    if (value.trim().length === 0) {
      suggestions.value = [];
    }
  }
);
</script>

<style scoped>
.search-bar {
  width: min(720px, 100%);
  margin: 0 auto;
}

.search-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

input[type='search'] {
  width: 100%;
  padding: 1rem 7.5rem 1rem 1.25rem;
  border-radius: 999px;
  border: 1px solid #cbd5f5;
  background: #fff;
  color: #0f172a;
  font-size: 1rem;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

input[type='search']::placeholder {
  color: #475569;
  opacity: 1;
}

input[type='search']:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

.search-action {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  padding: 0.65rem 1.75rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.search-action:hover {
  transform: translateY(-50%) scale(1.02);
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.35);
}

.suggestions {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  margin: 0;
  padding: 0.5rem 0;
  list-style: none;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.18);
  max-height: 18rem;
  overflow: auto;
  z-index: 10;
}

.suggestions li {
  display: flex;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.suggestions li:hover,
.suggestions li.active {
  background: rgba(99, 102, 241, 0.12);
}

.suggestion-symbol {
  font-weight: 700;
  color: #1e293b;
}

.suggestion-name {
  color: #475569;
}

.empty-state {
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(148, 163, 184, 0.18);
  border-radius: 0.75rem;
  color: #475569;
}

.error {
  margin-top: 0.5rem;
  color: #ef4444;
}
</style>
