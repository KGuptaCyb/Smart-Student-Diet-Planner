/**
 * Vitality Health Dashboard
 * Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==============================
    // BACKEND URL
    // ==============================
    const API_BASE_URL = "https://smart-student-diet-planner-1.onrender.com";

    /* ==========================================
       1. NAVIGATION LOGIC
       ========================================== */

    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');
    const pageTitle = document.getElementById('pageTitle');

    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');

    navItems.forEach(item => {
        item.addEventListener('click', () => {

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            pageTitle.innerText = item.innerText.trim();

            const target = item.getAttribute('data-target');

            sections.forEach(sec => {
                sec.classList.toggle('active', sec.id === target);
            });

            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }

            if (target === 'dashboard') updateDashboard();
        });
    });

    menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
    closeSidebar.addEventListener('click', () => sidebar.classList.remove('open'));

    /* ==========================================
       2. PROFILE APIs
       ========================================== */

    async function getUserData() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/profile`);
            return await res.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async function saveUserData(userData) {
        try {
            await fetch(`${API_BASE_URL}/api/profile`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });
        } catch (err) {
            console.error(err);
        }
    }

    /* ==========================================
       3. FOOD LOG APIs
       ========================================== */

    async function getFoodLog() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/food-log`);
            return await res.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    async function addFoodAPI(item) {
        try {
            await fetch(`${API_BASE_URL}/api/food-log`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(item)
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteFoodAPI(id) {
        try {
            await fetch(`${API_BASE_URL}/api/food-log/${id}`, {
                method: "DELETE"
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function clearFoodAPI() {
        try {
            await fetch(`${API_BASE_URL}/api/food-log`, {
                method: "DELETE"
            });
        } catch (err) {
            console.error(err);
        }
    }

    /* ==========================================
       4. INITIALIZE APP
       ========================================== */

    async function initApp() {

        const userData = await getUserData();

        if (userData && userData.name) {

            document.getElementById('userName').value = userData.name || '';
            document.getElementById('age').value = userData.age || '';
            document.getElementById('weight').value = userData.weight || '';
            document.getElementById('height').value = userData.height || '';
            document.getElementById('goal').value = userData.goal || '';
            document.getElementById('budget').value = userData.budget || '';

            document.getElementById('headerProfileName').innerText =
                `Hello, ${userData.name.split(' ')[0]}`;

        } else {
            document.querySelector('[data-target="profile"]').click();
        }

        await updateDashboard();
        await renderFoodLog();
    }

    /* ==========================================
       5. PROFILE FORM
       ========================================== */

    const profileForm = document.getElementById('profileForm');

    profileForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const userData = {
            name: document.getElementById('userName').value,
            age: parseInt(document.getElementById('age').value),
            weight: parseFloat(document.getElementById('weight').value),
            height: parseFloat(document.getElementById('height').value),
            goal: document.getElementById('goal').value,
            budget: document.getElementById('budget').value
        };

        await saveUserData(userData);

        document.getElementById('headerProfileName').innerText =
            `Hello, ${userData.name.split(' ')[0]}`;

        document.querySelector('[data-target="dashboard"]').click();

        updateDashboard();
    });

    /* ==========================================
       6. BMI + CALORIE FUNCTIONS
       ========================================== */

    function calculateBMI(weight, height) {

        const h = height / 100;
        const bmi = (weight / (h * h)).toFixed(1);

        let category = 'Normal';
        let className = 'badge-normal';

        if (bmi < 18.5) {
            category = 'Underweight';
            className = 'badge-underweight';
        } else if (bmi > 25) {
            category = 'Overweight';
            className = 'badge-overweight';
        }

        return { value: bmi, category, className };
    }

    function estimateDailyCalories(userData) {

        let bmr =
            (10 * userData.weight) +
            (6.25 * userData.height) -
            (5 * userData.age) + 5;

        let target = bmr * 1.3;

        if (userData.goal === 'loss') target -= 500;
        if (userData.goal === 'gain') target += 500;

        return Math.round(target);
    }

    /* ==========================================
       7. DASHBOARD
       ========================================== */

    async function updateDashboard() {

        const userData = await getUserData();

        if (!userData || !userData.name) return;

        document.getElementById('dashWeight').innerText = userData.weight;

        document.getElementById('dashGoal').innerText =
            userData.goal.toUpperCase() + ' WEIGHT';

        const target = estimateDailyCalories(userData);

        document.getElementById('dashTargetCalories').innerText = target;

        const bmiData = calculateBMI(userData.weight, userData.height);

        document.getElementById('dashBMI').innerText = bmiData.value;

        const bmiBadge = document.getElementById('dashBMICategory');

        bmiBadge.innerText = bmiData.category;
        bmiBadge.className = `badge ${bmiData.className}`;

        updateProgressBar(target);
    }

    /* ==========================================
       8. FOOD TRACKER
       ========================================== */

    const trackerForm = document.getElementById('trackerForm');
    const foodLogList = document.getElementById('foodLogList');

    document.querySelectorAll('.quick-log').forEach(tag => {

        tag.addEventListener('click', async (e) => {

            const name = e.target.getAttribute('data-name');
            const calories = parseInt(
                e.target.getAttribute('data-calories')
            );

            await addFoodToLog(name, calories);
        });
    });

    trackerForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const name = document.getElementById('foodName').value;

        const calories = parseInt(
            document.getElementById('foodCalories').value
        );

        if (name && calories) {

            await addFoodToLog(name, calories);

            trackerForm.reset();
        }
    });

    document.getElementById('clearLogBtn')
        .addEventListener('click', async () => {

            if (confirm("Clear today's food log?")) {

                await clearFoodAPI();

                renderFoodLog();
            }
        });

    async function addFoodToLog(name, calories) {

        await addFoodAPI({
            name,
            calories
        });

        renderFoodLog();
    }

    window.removeFoodItem = async function(id) {

        await deleteFoodAPI(id);

        renderFoodLog();
    };

    async function renderFoodLog() {

        const log = await getFoodLog();

        foodLogList.innerHTML = '';

        let total = 0;

        log.forEach(item => {

            total += item.calories;

            const li = document.createElement('li');

            li.className = 'log-item';

            li.innerHTML = `
                <div>
                    <span class="log-item-name">${item.name}</span>
                </div>

                <div>
                    <span class="log-item-cal">
                        ${item.calories} kcal
                    </span>

                    <button
                        class="log-delete"
                        onclick="removeFoodItem('${item.id}')">
                        &times;
                    </button>
                </div>
            `;

            foodLogList.appendChild(li);
        });

        document.getElementById('trackerTotal').innerText = total;

        const userData = await getUserData();

        if (userData && userData.name) {

            const target = estimateDailyCalories(userData);

            updateProgressBar(target);
        }
    }

    /* ==========================================
       9. PROGRESS BAR
       ========================================== */

    async function updateProgressBar(target) {

        const log = await getFoodLog();

        const total = log.reduce(
            (sum, item) => sum + item.calories,
            0
        );

        document.getElementById('calorieCountText').innerText =
            `${total} / ${target} kcal`;

        const bar = document.getElementById('calorieProgressBar');

        const notif = document.getElementById('calorieNotification');

        let pct = (total / target) * 100;

        if (pct > 100) pct = 100;

        bar.style.width = `${pct}%`;

        bar.classList.remove('limit-exceeded');

        notif.classList.add('hidden');

        notif.classList.remove('warning');

        if (total >= target) {

            bar.classList.add('limit-exceeded');

            notif.classList.remove('hidden');

            notif.classList.add('warning');

            notif.innerText =
                `⚠️ You exceeded limit by ${total - target} calories`;

        } else if (pct > 80) {

            notif.classList.remove('hidden');

            notif.innerText =
                `Heads up! You are approaching your limit.`;
        }
    }

    /* ==========================================
       10. START APP
       ========================================== */

    initApp();

});
