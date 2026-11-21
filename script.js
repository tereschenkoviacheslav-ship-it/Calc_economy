document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('habitForm');
  const errorContainer = document.getElementById('errorContainer');
  const resultsSection = document.getElementById('results');
  const journalList = document.getElementById('journalList');
  const clearJournalBtn = document.getElementById('clearJournalBtn');

  // Фразы для ошибок — строго по ТЗ
  const ERR_EMPTY = 'Можно было бы что-то и написать.';
  const ERR_NOT_NUMBER = 'Я калькулятор, а не азбука.';
  const ERR_ZERO = 'На нет и спроса нет)';
  const ERR_NEGATIVE = 'Так мы точно не поладим, введи положительное число, а то не с экономишь, а должен останешься.';

  const loadJournal = () => {
    const data = localStorage.getItem('habitCalculatorJournal') || '[]';
    const items = JSON.parse(data);
    renderJournal(items);
  };

  const saveJournal = (items) => {
    localStorage.setItem('habitCalculatorJournal', JSON.stringify(items));
    renderJournal(items);
  };

  const renderJournal = (items) => {
    journalList.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.time} | Привычка: "${item.habit}", Стоимость/день: ${item.cost} ₽ | 1 год: ${item.year} ₽, 5 лет: ${item['5y']} ₽, 10 лет: ${item['10y']} ₽`;
      journalList.appendChild(li);
    });
  };

  const validateNumber = (value) => {
    if (!value || value.trim() === '') {
      return { valid: false, message: ERR_EMPTY };
    }

    const normalized = value.replace(/\s+/g, '');
    // Разрешаем цифры и точку — остальное считаем ошибкой
    if (!/^[0-9.]+$/.test(normalized)) {
      return { valid: false, message: ERR_NOT_NUMBER };
    }

    const num = Number(normalized);
    if (isNaN(num)) {
      return { valid: false, message: ERR_NOT_NUMBER };
    }
    if (num === 0) {
      return { valid: false, message: ERR_ZERO };
    }
    if (num < 0) {
      return { valid: false, message: ERR_NEGATIVE };
    }
    return { valid: true, value: num };
  };

  const calculate = (habit, costPerDay) => {
    const daysInYear = 365;
    const yearCost = costPerDay * daysInYear;
    const fiveYearsCost = yearCost * 5;
    const tenYearsCost = yearCost * 10;

    // Фишка: альтернатива
    const altText = 'А если пить кофе через день, ты сэкономишь на отпуск.';

    return { year: yearCost, '5y': fiveYearsCost, '10y': tenYearsCost, alt: altText };
  };

  const updateUI = (result) => {
    document.getElementById('resultYear').textContent = result.year.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('result5Years').textContent = result['5y'].toLocaleString('ru-RU') + ' ₽';
    document.getElementById('result10Years').textContent = result['10y'].toLocaleString('ru-RU') + ' ₽';
    document.getElementById('alternativeText').textContent = result.alt;

    resultsSection.classList.remove('hidden');
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorContainer.textContent = '';

    const habitName = document.getElementById('habitName').value.trim();
    const costInput = document.getElementById('costPerDay').value;

    if (!habitName) {
      errorContainer.textContent = ERR_EMPTY;
      return;
    }

    const validCost = validateNumber(costInput);
    if (!validCost.valid) {
      errorContainer.textContent = validCost.message;
      return;
    }

    const costPerDay = validCost.value;
    const result = calculate(habitName, costPerDay);

    updateUI(result);

    // Журнал: добавляем новую запись
    const time = new Date().toLocaleTimeString('ru-RU');
    const journal = JSON.parse(localStorage.getItem('habitCalculatorJournal') || '[]');
    journal.push({
      time,
      habit: habitName,
      cost: costPerDay,
      year: result.year,
      '5y': result['5y'],
      '10y': result['10y'],
    });
    saveJournal(journal);
  });

  clearJournalBtn.addEventListener('click', () => {
    localStorage.removeItem('habitCalculatorJournal');
    renderJournal([]);
  });

  loadJournal();
});
