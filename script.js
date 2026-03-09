// Wedding Menu Selection App

const COM_TAM_PRICE = 60000;

// Category order for display
const CATEGORY_ORDER = [
    'soup', 'salad', 'rau', 'xoi', 'canh', 
    'ga', 'tom', 'ca', 'bo', 'khoai', 'trangmieng'
];

const CATEGORY_LABELS = {
    soup: '🥣 Soup',
    salad: '🥗 Salad',
    rau: '🥬 Rau',
    xoi: '🍚 Xôi',
    canh: '🍲 Canh',
    ga: '🍗 Gà',
    tom: '🦐 Tôm sú',
    ca: '🐟 Cá',
    bo: '🥩 Bò - Bê',
    khoai: '🍠 Khoai',
    trangmieng: '🍰 Tráng miệng'
};

// State
let selectedItems = {};
let drinksCost = 0;

// DOM Elements
const selectedItemsList = document.getElementById('selected-items');
const foodTotalEl = document.getElementById('food-total');
const drinksTotalEl = document.getElementById('drinks-total');
const grandTotalEl = document.getElementById('grand-total');
const drinksCostInput = document.getElementById('drinks-cost');
const exportBtn = document.getElementById('export-btn');
const exportModal = document.getElementById('export-modal');
const exportContent = document.getElementById('export-content');
const copyBtn = document.getElementById('copy-btn');
const closeModalBtn = document.querySelector('.close-modal');
const summaryHeader = document.querySelector('.summary-header');
const summaryPanel = document.querySelector('.summary-panel');

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

// Update selected items display
function updateDisplay() {
    // Clear list
    selectedItemsList.innerHTML = '';

    let foodTotal = 0;
    let hasItems = false;

    // Add items in order
    CATEGORY_ORDER.forEach(category => {
        if (selectedItems[category]) {
            hasItems = true;
            const item = selectedItems[category];
            foodTotal += item.price;

            const li = document.createElement('li');
            li.innerHTML = `
                <span class="item-name">${item.name}</span>
                <span class="item-price">${formatCurrency(item.price)}</span>
            `;
            selectedItemsList.appendChild(li);
        }
    });

    if (!hasItems) {
        selectedItemsList.innerHTML = '<li class="placeholder">Chưa chọn món nào</li>';
    }

    // Update totals
    foodTotalEl.textContent = formatCurrency(foodTotal);
    drinksTotalEl.textContent = formatCurrency(drinksCost);
    grandTotalEl.textContent = formatCurrency(foodTotal + COM_TAM_PRICE + drinksCost);
}

// Handle option selection
function handleOptionChange(e) {
    const input = e.target;
    const category = input.name;
    const price = parseInt(input.value);
    const name = input.dataset.name;

    selectedItems[category] = { name, price };
    updateDisplay();
}

// Handle drinks cost change
function handleDrinksCostChange(e) {
    drinksCost = parseInt(e.target.value) || 0;
    updateDisplay();
}

// Generate export text
function generateExportText() {
    let text = '🌸 THỰC ĐƠN TIỆC CƯỚI 🌸\n';
    text += '═══════════════════════════\n\n';

    let foodTotal = 0;

    CATEGORY_ORDER.forEach(category => {
        if (selectedItems[category]) {
            const item = selectedItems[category];
            foodTotal += item.price;
            text += `${CATEGORY_LABELS[category]}\n`;
            text += `  → ${item.name}: ${formatCurrency(item.price)}\n\n`;
        }
    });

    text += '═══════════════════════════\n';
    text += `Tổng món ăn: ${formatCurrency(foodTotal)}\n`;
    text += `Cơm tám: ${formatCurrency(COM_TAM_PRICE)}\n`;
    text += `Đồ uống: ${formatCurrency(drinksCost)}\n`;
    text += '═══════════════════════════\n';
    text += `💰 TỔNG HÓA ĐƠN: ${formatCurrency(foodTotal + COM_TAM_PRICE + drinksCost)}\n\n`;
    text += '💕 Chúc mừng hạnh phúc 💕';

    return text;
}

// Show export modal
function showExportModal() {
    exportContent.textContent = generateExportText();
    exportModal.classList.add('active');
}

// Close export modal
function closeExportModal() {
    exportModal.classList.remove('active');
}

// Copy to clipboard
async function copyToClipboard() {
    const text = generateExportText();
    try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = '✓ Đã sao chép';
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.textContent = '📋 Sao chép';
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        copyBtn.textContent = '✓ Đã sao chép';
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.textContent = '📋 Sao chép';
            copyBtn.classList.remove('copied');
        }, 2000);
    }
}

// Toggle summary panel (mobile)
function toggleSummary() {
    summaryPanel.classList.toggle('collapsed');
}

// Event Listeners
document.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', handleOptionChange);
});

drinksCostInput.addEventListener('input', handleDrinksCostChange);
exportBtn.addEventListener('click', showExportModal);
closeModalBtn.addEventListener('click', closeExportModal);
copyBtn.addEventListener('click', copyToClipboard);
summaryHeader.addEventListener('click', toggleSummary);

// Close modal when clicking outside
exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) {
        closeExportModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && exportModal.classList.contains('active')) {
        closeExportModal();
    }
});

// Initialize
updateDisplay();
