const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const USER_ID_KEY = 'smart-diet-planner-user-id';
const RECOMMENDATIONS = [
  { name: 'Peanut Butter Banana Oats', calories: 390, time: 'morning', categories: ['healthy', 'balanced'], budget: 'low', description: 'Oats, banana, milk, and peanut butter for a filling start.' },
  { name: 'Vegetable Poha with Curd', calories: 340, time: 'morning', categories: ['healthy', 'balanced'], budget: 'low', description: 'A quick, student-friendly breakfast with vegetables and yogurt.' },
  { name: 'Egg Bhurji and Roti', calories: 410, time: 'morning', categories: ['protein', 'balanced'], budget: 'low', description: 'Protein-rich eggs with whole-wheat roti.' },
  { name: 'Dal, Rice and Salad', calories: 520, time: 'afternoon', categories: ['healthy', 'balanced'], budget: 'low', description: 'A complete, affordable lunch with plant protein and fibre.' },
  { name: 'Chickpea Veg Wrap', calories: 460, time: 'afternoon', categories: ['protein', 'healthy'], budget: 'low', description: 'Spiced chickpeas and crunchy vegetables in a whole-wheat wrap.' },
  { name: 'Paneer Rice Bowl', calories: 610, time: 'afternoon', categories: ['protein', 'balanced'], budget: 'medium', description: 'Paneer, rice, vegetables, and a simple yogurt dressing.' },
  { name: 'Chicken Rice Bowl', calories: 640, time: 'afternoon', categories: ['protein', 'balanced'], budget: 'medium', description: 'Chicken, rice, vegetables, and a light sauce.' },
  { name: 'Moong Dal Chilla', calories: 360, time: 'evening', categories: ['protein', 'healthy'], budget: 'low', description: 'Crisp lentil pancakes with vegetables and chutney.' },
  { name: 'Rajma and Brown Rice', calories: 540, time: 'evening', categories: ['healthy', 'balanced'], budget: 'low', description: 'Comforting beans, rice, and salad for steady energy.' },
  { name: 'Tofu Stir-Fry Noodles', calories: 570, time: 'evening', categories: ['protein', 'balanced'], budget: 'medium', description: 'Tofu, vegetables, and noodles in a quick stir-fry.' },
  { name: 'Grilled Fish and Vegetables', calories: 500, time: 'evening', categories: ['protein', 'healthy'], budget: 'high', description: 'Lean protein with roasted vegetables and a side of grains.' }
];
const BUDGET_ORDER = { low: 1, medium: 2, high: 3 };

function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'x-user-id': getUserId(), ...options.headers }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Request failed. Please try again.');
  return body;
}

document.addEventListener('DOMContentLoaded', () => {
  const byId = (id) => document.getElementById(id);
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.page-section');
  const status = byId('appStatus');
  const sidebar = byId('sidebar');

  const showStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.remove('hidden', 'warning');
    status.classList.toggle('warning', isError);
  };
  const clearStatus = () => status.classList.add('hidden');
  const setSection = (target) => {
    navItems.forEach((item) => item.classList.toggle('active', item.dataset.target === target));
    sections.forEach((section) => section.classList.toggle('active', section.id === target));
    byId('pageTitle').textContent = document.querySelector(`[data-target="${target}"]`).textContent.trim();
    sidebar.classList.remove('open');
    if (target === 'dashboard') updateDashboard();
  };

  navItems.forEach((item) => item.addEventListener('click', () => setSection(item.dataset.target)));
  byId('menuToggle').addEventListener('click', () => sidebar.classList.add('open'));
  byId('closeSidebar').addEventListener('click', () => sidebar.classList.remove('open'));

  const calculateBMI = (weight, height) => {
    const value = weight / ((height / 100) ** 2);
    if (value < 18.5) return { value: value.toFixed(1), category: 'Underweight', className: 'badge-underweight' };
    if (value < 25) return { value: value.toFixed(1), category: 'Normal', className: 'badge-normal' };
    if (value < 30) return { value: value.toFixed(1), category: 'Overweight', className: 'badge-overweight' };
    return { value: value.toFixed(1), category: 'Obesity range', className: 'badge-overweight' };
  };
  const estimateDailyCalories = (user) => {
    const sexAdjustment = user.sex === 'male' ? 5 : user.sex === 'female' ? -161 : -78;
    const bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) + sexAdjustment;
    const multiplier = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }[user.activityLevel] || 1.2;
    const goalAdjustment = { loss: -300, maintain: 0, gain: 300 }[user.goal] || 0;
    return Math.max(1200, Math.round(bmr * multiplier + goalAdjustment));
  };
  const getProfile = async () => (await api('/api/profile')).data;
  const getFoodLog = async () => (await api('/api/food-log')).data || [];
  const getWeeklyHistory = async () => (await api('/api/food-log/history')).data || [];
  let recommendationOffset = 0;

  async function updateProgressBar(target) {
    const log = await getFoodLog();
    const total = log.reduce((sum, item) => sum + Number(item.calories), 0);
    byId('calorieCountText').textContent = `${total} / ${target} kcal`;
    const percent = Math.min(100, (total / target) * 100);
    byId('calorieProgressBar').style.width = `${percent}%`;
    const notification = byId('calorieNotification');
    notification.classList.toggle('hidden', total < target * 0.8);
    notification.classList.toggle('warning', total >= target);
    notification.textContent = total >= target ? `⚠️ You exceeded your target by ${total - target} calories.` : 'Heads up! You are approaching your daily target.';
  }

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  async function renderWeeklyHistory(target) {
    const history = await getWeeklyHistory();
    const chart = byId('weeklyChart');
    chart.replaceChildren();
    const hasData = history.some((day) => Number(day.calories) > 0);
    byId('historyEmptyState').classList.toggle('hidden', hasData);

    const width = 700; const height = 250; const left = 52; const right = 22; const top = 24; const bottom = 36;
    const chartHeight = height - top - bottom;
    const maxValue = Math.max(target, ...history.map((day) => Number(day.calories)), 200);
    const y = (value) => top + chartHeight - (value / maxValue) * chartHeight;
    const baseline = top + chartHeight;
    const title = svgElement('title'); title.textContent = 'Seven-day calorie history, with daily intake bars and a daily target line.'; chart.append(title);

    [0, 0.5, 1].forEach((ratio) => {
      const value = Math.round(maxValue * ratio);
      const yPosition = y(value);
      chart.append(svgElement('line', { x1: left, y1: yPosition, x2: width - right, y2: yPosition, class: 'chart-grid' }));
      const label = svgElement('text', { x: left - 8, y: yPosition + 4, 'text-anchor': 'end', class: 'chart-axis-label' }); label.textContent = value; chart.append(label);
    });
    const targetY = y(target);
    chart.append(svgElement('line', { x1: left, y1: targetY, x2: width - right, y2: targetY, class: 'chart-target' }));
    const targetLabel = svgElement('text', { x: width - right, y: Math.max(14, targetY - 6), 'text-anchor': 'end', class: 'chart-target-label' }); targetLabel.textContent = `Target ${target}`; chart.append(targetLabel);

    const usableWidth = width - left - right;
    const step = usableWidth / history.length;
    history.forEach((day, index) => {
      const calories = Number(day.calories);
      const barWidth = Math.min(44, step * 0.56);
      const x = left + index * step + (step - barWidth) / 2;
      const barHeight = Math.max(0, baseline - y(calories));
      const bar = svgElement('rect', { x, y: baseline - barHeight, width: barWidth, height: barHeight, rx: 4, class: 'chart-bar' });
      const description = svgElement('title'); description.textContent = `${new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}: ${calories} kcal`; bar.append(description); chart.append(bar);
      const label = svgElement('text', { x: x + barWidth / 2, y: height - 13, 'text-anchor': 'middle', class: 'chart-axis-label' });
      label.textContent = new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' }); chart.append(label);
    });
  }

  function renderRecommendations(user) {
    const time = byId('filterTime').value;
    const category = byId('filterCategory').value;
    const meals = RECOMMENDATIONS
      .filter((meal) => meal.time === time && BUDGET_ORDER[meal.budget] <= BUDGET_ORDER[user.budget] && (category === 'all' || meal.categories.includes(category)))
      .sort((first, second) => first.calories - second.calories);
    const rotated = meals.length ? [...meals.slice(recommendationOffset % meals.length), ...meals.slice(0, recommendationOffset % meals.length)] : [];
    const grid = byId('mealsGrid'); grid.replaceChildren();
    const budgetLabel = user.budget === 'low' ? 'student-friendly' : user.budget;
    byId('upgradeMessage').textContent = `Recommendations tailored for your ${user.goal} goal and ${budgetLabel} budget.`;
    if (!rotated.length) {
      const empty = document.createElement('p'); empty.className = 'text-muted'; empty.textContent = 'No meals match this filter. Try another category.'; grid.append(empty); return;
    }
    rotated.slice(0, 3).forEach((meal) => {
      const card = document.createElement('article'); card.className = 'meal-card';
      const header = document.createElement('div'); header.className = 'meal-header';
      const title = document.createElement('h3'); title.className = 'meal-title'; title.textContent = meal.name;
      const categoryBadge = document.createElement('span'); categoryBadge.className = 'meal-category'; categoryBadge.textContent = meal.categories[0];
      const description = document.createElement('p'); description.className = 'meal-desc'; description.textContent = meal.description;
      const stats = document.createElement('div'); stats.className = 'meal-stats';
      const calories = document.createElement('span'); calories.textContent = `${meal.calories} kcal`;
      const budget = document.createElement('span'); budget.textContent = `${meal.budget} budget`;
      const add = document.createElement('button'); add.type = 'button'; add.className = 'btn btn-primary recommendation-action'; add.textContent = 'Add to today’s log';
      add.addEventListener('click', async () => { await addFood(meal.name, meal.calories); showStatus(`${meal.name} added to today’s log.`); });
      header.append(title, categoryBadge); stats.append(calories, budget); card.append(header, description, stats, add); grid.append(card);
    });
  }

  async function updateDashboard() {
    try {
      const user = await getProfile();
      if (!user) return;
      byId('dashWeight').textContent = user.weight;
      byId('dashGoal').textContent = `${user.goal.toUpperCase()} WEIGHT`;
      const target = estimateDailyCalories(user);
      byId('dashTargetCalories').textContent = target;
      const bmi = calculateBMI(Number(user.weight), Number(user.height));
      byId('dashBMI').textContent = bmi.value;
      byId('dashBMICategory').textContent = bmi.category;
      byId('dashBMICategory').className = `badge ${bmi.className}`;
      await updateProgressBar(target);
      await renderWeeklyHistory(target);
      renderRecommendations(user);
    } catch (error) { showStatus(error.message, true); }
  }

  async function renderFoodLog() {
    try {
      const log = await getFoodLog();
      const list = byId('foodLogList');
      list.replaceChildren();
      let total = 0;
      log.forEach((item) => {
        total += Number(item.calories);
        const li = document.createElement('li'); li.className = 'log-item';
        const description = document.createElement('div');
        const name = document.createElement('span'); name.className = 'log-item-name'; name.textContent = item.name;
        description.append(name);
        const action = document.createElement('div');
        const calories = document.createElement('span'); calories.className = 'log-item-cal'; calories.textContent = `${item.calories} kcal`;
        const remove = document.createElement('button'); remove.className = 'log-delete'; remove.type = 'button'; remove.setAttribute('aria-label', `Remove ${item.name}`); remove.textContent = '×';
        remove.addEventListener('click', async () => { try { await api(`/api/food-log/${item.id}`, { method: 'DELETE' }); await renderFoodLog(); await updateDashboard(); } catch (error) { showStatus(error.message, true); } });
        action.append(calories, remove); li.append(description, action); list.append(li);
      });
      byId('trackerTotal').textContent = total;
    } catch (error) { showStatus(error.message, true); }
  }

  byId('profileForm').addEventListener('submit', async (event) => {
    event.preventDefault(); clearStatus();
    const user = {
      name: byId('userName').value, age: Number(byId('age').value), weight: Number(byId('weight').value), height: Number(byId('height').value),
      sex: byId('sex').value, activityLevel: byId('activityLevel').value, goal: byId('goal').value, budget: byId('budget').value
    };
    try {
      const result = await api('/api/profile', { method: 'POST', body: JSON.stringify(user) });
      byId('headerProfileName').textContent = `Hello, ${result.data.name.split(/\s+/)[0]}`;
      showStatus('Profile saved.'); setSection('dashboard'); await updateDashboard();
    } catch (error) { showStatus(error.message, true); }
  });

  async function addFood(name, calories) {
    try { await api('/api/food-log', { method: 'POST', body: JSON.stringify({ name, calories }) }); await renderFoodLog(); await updateDashboard(); }
    catch (error) { showStatus(error.message, true); }
  }
  byId('trackerForm').addEventListener('submit', async (event) => {
    event.preventDefault(); const name = byId('foodName').value.trim(); const calories = Number(byId('foodCalories').value);
    if (!name || !Number.isInteger(calories)) return showStatus('Enter a food name and whole-number calories.', true);
    await addFood(name, calories); event.target.reset();
  });
  document.querySelectorAll('.quick-log').forEach((tag) => tag.addEventListener('click', () => addFood(tag.dataset.name, Number(tag.dataset.calories))));
  byId('filterTime').addEventListener('change', async () => {
    const user = await getProfile(); if (user) renderRecommendations(user);
  });
  byId('filterCategory').addEventListener('change', async () => {
    const user = await getProfile(); if (user) renderRecommendations(user);
  });
  byId('refreshMeals').addEventListener('click', async () => {
    const user = await getProfile(); recommendationOffset += 1; if (user) renderRecommendations(user);
  });
  byId('clearLogBtn').addEventListener('click', async () => {
    if (!confirm("Clear today's food log?")) return;
    try { await api('/api/food-log', { method: 'DELETE' }); await renderFoodLog(); await updateDashboard(); }
    catch (error) { showStatus(error.message, true); }
  });

  async function init() {
    try {
      const user = await getProfile();
      if (user) {
        ['name', 'age', 'weight', 'height', 'sex', 'activityLevel', 'goal', 'budget'].forEach((key) => {
          const input = byId(key === 'name' ? 'userName' : key); if (input) input.value = user[key];
        });
        byId('headerProfileName').textContent = `Hello, ${user.name.split(/\s+/)[0]}`;
        await updateDashboard(); await renderFoodLog();
      } else setSection('profile');
    } catch (error) { showStatus(`Cannot reach the API: ${error.message}`, true); setSection('profile'); }
  }
  init();
});
