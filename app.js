// Простая текстовая игра-квест для Telegram WebApp и обычного браузера.
// Работает без фреймворков, все кнопки создаются динамически.

// Безопасная проверка Telegram WebApp
const tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;

// Попытка расширить WebApp, если мы внутри Telegram
if (tg && typeof tg.expand === 'function') {
  try { tg.expand(); } catch (e) { console.warn('tg.expand() failed', e); }
} else {
  // Работает и в обычном браузере
  console.log('Telegram WebApp not found — running in regular browser.');
}

// --- Сцены игры ---
// Каждый ключ — id сцены. У сцены есть text и choices.
// choices — массив объектов { text: 'Текст кнопки', next: 'sceneId' }
const scenes = {
  start: {
    text: "Вы просыпаетесь на опушке тёмного леса. Впереди виднеются тропинка вглубь леса и узкий проход к пещере. Куда вы пойдёте?",
    choices: [
      { text: "Пойти по тропинке в лес", next: "forestPath" },
      { text: "Осмотреть пещеру", next: "caveEntrance" }
    ]
  },

  // Ветка: лес
  forestPath: {
    text: "Вы осторожно идёте по тропинке. Ветки шуршат, и через несколько минут вы находите старый колодец и домик.",
    choices: [
      { text: "Подойти к колодцу", next: "well" },
      { text: "Пойти к домику", next: "cottage" }
    ]
  },

  well: {
    text: "Колодец глубокий и тёмный. Внутри вы находите старую светящуюся монету. Это — знак удачи. Вы возвращаетесь домой с наградой.",
    choices: [
      { text: "Завершить (финал: удача)", next: "endingLuck" }
    ]
  },

  cottage: {
    text: "В домике живёт старушка, которая даёт вам задание помочь ей. Вы согласились и теперь чувствуете, что ваша жизнь изменилась.",
    choices: [
      { text: "Завершить (финал: судьба помощника)", next: "endingHelper" }
    ]
  },

  // Ветка: пещера
  caveEntrance: {
    text: "Пещера прохладна и эхо доносит странные звуки. Внутри вы видите два прохода: один влево, другой вправо.",
    choices: [
      { text: "Идти влево", next: "leftPass" },
      { text: "Идти вправо", next: "rightPass" }
    ]
  },

  leftPass: {
    text: "Вы натыкаетесь на сокровища и реликвии. Но их охраняет загадочный страж, который приветствует вас.",
    choices: [
      { text: "Поговорить со стражем", next: "endingTreasure" }
    ]
  },

  rightPass: {
    text: "Проход ведёт к глубокому подземелью, и вы обнаруживаете древние надписи. Понимание их меняет вас навсегда.",
    choices: [
      { text: "Завершить (финал: знание)", next: "endingKnowledge" }
    ]
  },

  // Финалы (два разных финала обязательны; здесь несколько финалов)
  endingLuck: {
    text: "ФИНАЛ — Удача: монета приносит вам богатство, и вы возвращаетесь домой героем.",
    choices: [
      { text: "Играть заново", next: "start" }
    ]
  },

  endingHelper: {
    text: "ФИНАЛ — Судьба помощника: вы остаетесь в доме старушки и находите новый смысл жизни.",
    choices: [
      { text: "Играть заново", next: "start" }
    ]
  },

  endingTreasure: {
    text: "ФИНАЛ — Сокровища: вы находите клад и учитесь мудрости стража.",
    choices: [
      { text: "Играть заново", next: "start" }
    ]
  },

  endingKnowledge: {
    text: "ФИНАЛ — Знание: древние надписи раскрывают вам тайну мира.",
    choices: [
      { text: "Играть заново", next: "start" }
    ]
  }
};

// Текущая сцена
let currentScene = 'start';

// Ссылки на DOM
const sceneTextEl = document.getElementById('scene-text');
const choicesEl = document.getElementById('choices');
const restartBtn = document.getElementById('restartBtn');

// Отрисовывает сцену: текст и кнопки выбора
function renderScene() {
  const scene = scenes[currentScene];
  if (!scene) {
    sceneTextEl.textContent = "Ошибка: сцена не найдена.";
    choicesEl.innerHTML = '';
    return;
  }

  // Устанавливаем текст сцены
  sceneTextEl.textContent = scene.text;

  // Очищаем старые кнопки
  choicesEl.innerHTML = '';

  // Создаём кнопку для каждого варианта
  scene.choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.type = 'button';
    btn.textContent = choice.text;
    // Навешиваем обработчик
    btn.addEventListener('click', () => handleChoice(choice.next));
    choicesEl.appendChild(btn);
  });
}

// Обработчик выбора: переключает currentScene и перерисовывает
function handleChoice(nextSceneId) {
  if (!nextSceneId) return;
  if (!scenes[nextSceneId]) {
    console.warn('Попытка перейти в несуществующую сцену:', nextSceneId);
    return;
  }
  currentScene = nextSceneId;

  // Если мы внутри Telegram, можно выполнить дополнительные действия,
  // например: менять заголовок кнопки меню (не обязательно здесь).
  // tg и window.Telegram.WebApp доступны выше по коду.
  renderScene();

  // Если есть метод для изменения размера интерфейса, можно вызвать снова
  if (tg && typeof tg.expand === 'function') {
    try { tg.expand(); } catch (e) { /* не критично */ }
  }
}

// Перезапуск игры
restartBtn.addEventListener('click', () => {
  currentScene = 'start';
  renderScene();
  if (tg && typeof tg.expand === 'function') {
    try { tg.expand(); } catch (e) { /* ignore */ }
  }
});

// Инициализация после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
  renderScene();

  // Безопасная попытка использовать Telegram WebApp API дополнительно
  if (tg) {
    try {
      // Некоторые функции WebApp удобны: setBackgroundColor, setHeaderColor и т.п.
      // Здесь вызываем-ready, если нужно, но не обязательно:
      if (typeof tg.ready === 'function') tg.ready();
    } catch (e) {
      console.warn('Telegram WebApp init error', e);
    }
  }
});
