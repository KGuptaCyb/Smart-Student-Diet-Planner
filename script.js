/**
 * Vitality Health Dashboard 
 * Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = "https://smart-student-diet-planner-1.onrender.com";

    /* ==========================================
       1. NAVIGATION LOGIC
       ========================================== */
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');
    const pageTitle = document.getElementById('pageTitle');
    
    // Mobile Sidebar Toggles
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active nav state
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Update title
            pageTitle.innerText = item.innerText.trim();

            // Toggle corresponding section
            const target = item.getAttribute('data-target');
            sections.forEach(sec => {
                if (sec.id === target) {
                    sec.classList.add('active');
                } else {
                    sec.classList.remove('active');
                }
            });

            // Close sidebar automatically on mobile after click
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }

            // Refresh dashboards/trackers dynamically when navigated to
            if(target === 'dashboard') updateDashboard();
        });
    });

    menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
    closeSidebar.addEventListener('click', () => sidebar.classList.remove('open'));


    /* ==========================================
       2. USER PROFILE DATA RECOVERY ($document.ready)
       ========================================== */
    const profileForm = document.getElementById('profileForm');
    
    // function getUserData() {
    //     return JSON.parse(localStorage.getItem('vitalityUserData')) || null;
    // }
    async function getUserData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/profile`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
}

    // Initialize UI on start
    async function initApp() {
        //const userData = getUserData();
        const userData = await getUserData();
        if (userData) {
            // Fill Form Back in
            document.getElementById('userName').value = userData.name;
            document.getElementById('age').value = userData.age;
            document.getElementById('weight').value = userData.weight;
            document.getElementById('height').value = userData.height;
            document.getElementById('goal').value = userData.goal;
            document.getElementById('budget').value = userData.budget;

            document.getElementById('headerProfileName').innerText = `Hello, ${userData.name.split(' ')[0]}`;
        } else {
            // No profile? Prompt them by switching to profile section immediately
            document.querySelector('[data-target="profile"]').click();
        }
        
        updateDashboard();
        renderFoodLog();
    }


    /* ==========================================
       3. PROFILE FORM SUBMIT & CALCULATIONS
       ========================================== */
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('userName').value,
            age: parseInt(document.getElementById('age').value),
            weight: parseFloat(document.getElementById('weight').value),
            height: parseFloat(document.getElementById('height').value),
            goal: document.getElementById('goal').value,
            budget: document.getElementById('budget').value
        };

        //localStorage.setItem('vitalityUserData', JSON.stringify(userData));
        fetch(`${API_BASE_URL}/api/profile`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
})
.then(res => res.json())
.then(data => {
    console.log("Profile saved:", data);
})
.catch(err => console.error(err));
        document.getElementById('headerProfileName').innerText = `Hello, ${userData.name.split(' ')[0]}`;
        
        // Go back to Dashboard after saving profile
        document.querySelector('[data-target="dashboard"]').click();
        updateDashboard();
    });

    // Compute BMI standard categorical values
    function calculateBMI(weight, height) {
        const heightMeters = height / 100;
        const bmi = (weight / (heightMeters * heightMeters)).toFixed(1);
        let category = 'Normal';
        let className = 'badge-normal';

        if (bmi < 18.5) { category = 'Underweight'; className = 'badge-underweight'; }
        else if (bmi > 25) { category = 'Overweight'; className = 'badge-overweight'; }
        
        return { value: bmi, category, className };
    }

    function estimateDailyCalories(userData) {
        // Simple Mifflin-St Jeor estimation Base
        // For simplicity assuming average metric formula: 10 * weight + 6.25 * height - 5 * age + 5
        let bmr = (10 * userData.weight) + (6.25 * userData.height) - (5 * userData.age) + 5;
        // Multiply by mild activity factor avg 1.3
        let target = bmr * 1.3;

        // Modify based on goal
        if (userData.goal === 'loss') target -= 500; // Deficit
        if (userData.goal === 'gain') target += 500; // Surplus
        
        return Math.round(target);
    }

    function updateDashboard() {
        const userData = getUserData();
        if (!userData) return;

        // 1. Fill Summary Cards
        document.getElementById('dashWeight').innerText = userData.weight;
        document.getElementById('dashGoal').innerText = userData.goal.toUpperCase() + ' WEIGHT';
        
        const targetCals = estimateDailyCalories(userData);
        document.getElementById('dashTargetCalories').innerText = targetCals;

        const bmiData = calculateBMI(userData.weight, userData.height);
        document.getElementById('dashBMI').innerText = bmiData.value;
        const bmiBadge = document.getElementById('dashBMICategory');
        bmiBadge.innerText = bmiData.category;
        bmiBadge.className = `badge ${bmiData.className}`;

        // 2. Fetch and Render Meals
        getMealSuggestions(userData);

        // 3. Update Progress Bar state based on Dashboard target
        updateProgressBar(targetCals);
    }


    /* ==========================================
       4. MEAL RECOMMENDATION & BEHAVIOR Engine
       ========================================== */
    const foodDatabase = [
        // Breakfast
        { id: 'b1', time: 'morning', budget: 'low', category: 'healthy', title: 'Oatmeal & Banana', desc: 'Rolled oats with a sliced banana.', calories: 300, healthScore: 8 },
        { id: 'b2', time: 'morning', budget: 'low', category: 'protein', title: 'Boiled Eggs & Toast', desc: '3 hard-boiled eggs with whole wheat toast.', calories: 350, healthScore: 7 },
        { id: 'b3', time: 'morning', budget: 'medium', category: 'balanced', title: 'Greek Yogurt & Honey', desc: 'Thick greek yogurt, walnuts, and honey.', calories: 250, healthScore: 9 },
        { id: 'b4', time: 'morning', budget: 'high', category: 'protein', title: 'Avocado Salmon Toast', desc: 'Sourdough toast with avocado spread and smoked salmon.', calories: 450, healthScore: 9 },
        
        // Lunch
        { id: 'l1', time: 'afternoon', budget: 'low', category: 'balanced', title: 'Rice and Beans', desc: 'Classic black beans over brown rice.', calories: 400, healthScore: 6 },
        { id: 'l2', time: 'afternoon', budget: 'medium', category: 'healthy', title: 'Grilled Chicken Salad', desc: 'Mixed greens, cherry tomatoes, and grilled chicken breast.', calories: 350, healthScore: 9 },
        { id: 'l3', time: 'afternoon', budget: 'high', category: 'protein', title: 'Quinoa Tuna Bowl', desc: 'Ahi tuna strips over seasoned quinoa.', calories: 500, healthScore: 10 },
        { id: 'l4', time: 'afternoon', budget: 'low', category: 'protein', title: 'Ramen (Instant)', desc: 'Instant noodles with an egg.', calories: 450, healthScore: 3 }, // Low score for upgrade testing

        // Dinner
        { id: 'd1', time: 'evening', budget: 'low', category: 'healthy', title: 'Vegetable Stir-fry', desc: 'Mixed vegetables and tofu pan-fried in minimal oil.', calories: 380, healthScore: 9 },
        { id: 'd2', time: 'evening', budget: 'medium', category: 'balanced', title: 'Baked Chicken & Broccoli', desc: 'Oven-roasted chicken thighs with steamed broccoli.', calories: 500, healthScore: 8 },
        { id: 'd3', time: 'evening', budget: 'high', category: 'protein', title: 'Steak & Sweet Potato', desc: 'Sirloin steak with roasted sweet potatoes.', calories: 650, healthScore: 7 },
        { id: 'd4', time: 'evening', budget: 'medium', category: 'protein', title: 'Beef Pasta', desc: 'Pasta mixed with ground beef and tomato sauce.', calories: 700, healthScore: 5 }
    ];

    document.getElementById('refreshMeals').addEventListener('click', () => {
        updateDashboard();
    });

    function getMealSuggestions(userData) {
        const timeFilter = document.getElementById('filterTime').value;
        const categoryFilter = document.getElementById('filterCategory').value;

        // Fetch User's past selection behavior
        const trackHistory = JSON.parse(localStorage.getItem('vitalityBehaviorLog')) || [];
        const lastSelectionId = trackHistory.length ? trackHistory[trackHistory.length - 1] : null;
        const lastSelection = foodDatabase.find(f => f.id === lastSelectionId);

        // Filter Logic
        let suggestions = foodDatabase.filter(meal => {
            let pass = true;
            if (meal.time !== timeFilter) pass = false;
            if (categoryFilter !== 'all' && meal.category !== categoryFilter) pass = false;
            // Strict Budget filter (unless high, meaning they can afford anything)
            if (userData.budget === 'low' && meal.budget !== 'low') pass = false;
            if (userData.budget === 'medium' && meal.budget === 'high') pass = false;
            return pass;
        });

        // Fallback if filters are completely empty (e.g. low budget looking for high protein only)
        if (suggestions.length === 0) {
            suggestions = foodDatabase.filter(m => m.time === timeFilter); // Fall back to just matching the time
        }

        // Behavior check: If their last picked item had low healthScore, promote healthy items
        const upgradeMsgEl = document.getElementById('upgradeMessage');
        upgradeMsgEl.classList.add('hidden');
        upgradeMsgEl.innerHTML = '';

        if (lastSelection && lastSelection.healthScore < 6 && suggestions.length > 0) {
            // Pick meals that have a strictly better health score
            let betterOptions = suggestions.filter(m => m.healthScore > lastSelection.healthScore);
            
            if (betterOptions.length > 0) {
                // Sort array to put healthier combinations at the top
                betterOptions.sort((a,b) => b.healthScore - a.healthScore); // descending health
                const otherOptions = suggestions.filter(m => m.healthScore <= lastSelection.healthScore);
                suggestions = [...betterOptions, ...otherOptions];
                
                upgradeMsgEl.classList.remove('hidden');
                upgradeMsgEl.innerHTML = `✨ We noticed your last choice was <b>${lastSelection.title}</b>. We've rearranged suggestions to prioritize healthier alternatives!`;
            }
        }

        // Limit to 3 visual cards
        renderMealCards(suggestions.slice(0, 3));
    }

    function renderMealCards(meals) {
        const grid = document.getElementById('mealsGrid');
        grid.innerHTML = '';

        if(meals.length === 0) {
            grid.innerHTML = '<p class="text-muted">No specific meals found for these constraints.</p>';
            return;
        }

        meals.forEach(meal => {
            const card = document.createElement('div');
            card.className = 'meal-card';
            card.innerHTML = `
                <div class="meal-header">
                    <h3 class="meal-title">${meal.title}</h3>
                    <span class="meal-category">${meal.category}</span>
                </div>
                <p class="meal-desc">${meal.desc}</p>
                <div class="meal-stats">
                    <span>${meal.calories} kcal</span>
                    <span style="color:var(--text-muted)">Score: ${meal.healthScore}/10</span>
                </div>
                <button class="btn btn-primary select-meal-btn" data-id="${meal.id}" style="width:100%; border-radius:6px; padding:0.6rem;">Suggest this to Tracker</button>
            `;
            grid.appendChild(card);
        });

        // Attach listeners for behavioral logging
        document.querySelectorAll('.select-meal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                logMealSelectionBehavior(id);
                
                // Show visual confirmation
                e.target.innerText = 'Log Updated!';
                e.target.style.background = 'var(--secondary)';
                
                // Also add it directly to tracker
                const selected = foodDatabase.find(f => f.id === id);
                addFoodToLog(selected.title, selected.calories);
            });
        });
    }

    function logMealSelectionBehavior(id) {
        const history = JSON.parse(localStorage.getItem('vitalityBehaviorLog')) || [];
        history.push(id);
        if (history.length > 5) history.shift(); // just keep last 5
        localStorage.setItem('vitalityBehaviorLog', JSON.stringify(history));
    }


    /* ==========================================
       5. FOOD TRACKER LOGIC
       ========================================== */
    const trackerForm = document.getElementById('trackerForm');
    const foodLogList = document.getElementById('foodLogList');
    
    // Quick Add tags logic
    document.querySelectorAll('.quick-log').forEach(tag => {
        tag.addEventListener('click', (e) => {
            const name = e.target.getAttribute('data-name');
            const cals = parseInt(e.target.getAttribute('data-calories'));
            addFoodToLog(name, cals);
        });
    });

    trackerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('foodName').value;
        const cals = parseInt(document.getElementById('foodCalories').value);
        if(name && cals) {
            addFoodToLog(name, cals);
            trackerForm.reset();
        }
    });

    document.getElementById('clearLogBtn').addEventListener('click', () => {
        if(confirm("Are you sure you want to clear today's food log?")) {
            localStorage.setItem('vitalityFoodLog', JSON.stringify([]));
            renderFoodLog();
        }
    });

    // Main tracking logic hook
    function addFoodToLog(name, calories) {
        const log = JSON.parse(localStorage.getItem('vitalityFoodLog')) || [];
        log.push({
            id: Date.now(),
            name: name,
            calories: calories
        });
        localStorage.setItem('vitalityFoodLog', JSON.stringify(log));
        renderFoodLog();
    }

    // Delete single item from log
    window.removeFoodItem = function(id) {
        let log = JSON.parse(localStorage.getItem('vitalityFoodLog')) || [];
        log = log.filter(item => item.id !== id);
        localStorage.setItem('vitalityFoodLog', JSON.stringify(log));
        renderFoodLog();
    };

    function renderFoodLog() {
        const log = JSON.parse(localStorage.getItem('vitalityFoodLog')) || [];
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
                    <span class="log-item-cal">${item.calories} kcal</span>
                    <button class="log-delete" onclick="removeFoodItem(${item.id})" title="Remove item">&times; </button>
                </div>
            `;
            foodLogList.appendChild(li);
        });

        document.getElementById('trackerTotal').innerText = total;

        // Recalculate Dashboard progress immediately
        const userData = getUserData();
        if(userData) {
            const target = estimateDailyCalories(userData);
            updateProgressBar(target);
        }
    }


    /* ==========================================
       6. PROGRESS BAR SYNCHRONIZATION
       ========================================== */
    function updateProgressBar(target) {
        const log = JSON.parse(localStorage.getItem('vitalityFoodLog')) || [];
        const totalConsumed = log.reduce((sum, item) => sum + item.calories, 0);

        document.getElementById('calorieCountText').innerText = `${totalConsumed} / ${target} kcal`;
        
        const bar = document.getElementById('calorieProgressBar');
        const notif = document.getElementById('calorieNotification');
        
        // Calculate percentage (max 100% for visual width)
        let pct = (totalConsumed / target) * 100;
        if(pct > 100) pct = 100;
        
        bar.style.width = `${pct}%`;

        // Reset states
        bar.classList.remove('limit-exceeded');
        notif.classList.add('hidden');
        notif.classList.remove('warning');

        if (totalConsumed >= target) {
            bar.classList.add('limit-exceeded');
            notif.classList.remove('hidden');
            notif.classList.add('warning');
            notif.innerText = `⚠️ You have exceeded your daily limit by ${totalConsumed - target} calories!`;
        } else if (pct > 80) {
            notif.classList.remove('hidden');
            notif.innerText = `Heads up! You are approaching your daily limit.`;
        }
    }

    // BOOTSTRAP APP
    initApp();

});
