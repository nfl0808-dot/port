/* ============================================================
   ДВУЯЗЫЧНЫЙ ПЕРЕКЛЮЧАТЕЛЬ (RU / EN) + АВТООПРЕДЕЛЕНИЕ ПО IP
   Как это работает:
   • Каждая страница определяет свой словарь window.TRANSLATIONS
     (объект вида {ключ: {ru: "...", en: "..."}})
   • Элементы в HTML помечены атрибутом data-i18n="ключ"
   • Если человек ЕЩЁ НИ РАЗУ не нажимал RU/EN вручную — при заходе
     на сайт делаем запрос к бесплатному geo-IP сервису (ipwho.is):
     IP из России → русская версия, любой другой IP → английская.
     Пока идёт запрос, на долю секунды показывается русский текст
     по умолчанию — это нормально, так устроен статический сайт.
   • Как только человек сам нажал RU или EN — выбор запоминается
     в localStorage и больше НИКОГДА не переопределяется по IP,
     ни на этой странице, ни на других страницах сайта.
   Чтобы добавить новый переводимый элемент:
     1. Добавь ему data-i18n="имя_ключа"
     2. Добавь имя_ключа: {ru:"...", en:"..."} в TRANSLATIONS на странице
   ============================================================ */
(function(){
  var STORAGE_KEY = 'site-lang';
  var saved = null;
  try{ saved = localStorage.getItem(STORAGE_KEY); }catch(e){}

  function render(l){
    document.documentElement.setAttribute('lang', l);
    var dict = window.TRANSLATIONS || {};
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var entry = dict[el.getAttribute('data-i18n')];
      if(entry && entry[l] !== undefined){ el.innerHTML = entry[l]; }
    });
    if(dict.__title && dict.__title[l]){ document.title = dict.__title[l]; }
    document.querySelectorAll('.lang-switch button').forEach(function(btn){
      var active = btn.getAttribute('data-lang') === l;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function setLang(l, persist){
    render(l);
    if(persist){ try{ localStorage.setItem(STORAGE_KEY, l); }catch(e){} }
  }

  // Бесплатный geo-IP сервис без ключа, работает по HTTPS из браузера.
  // Если сервис недоступен (лимит, блокировка, нет сети) — тихо остаёмся на русском.
  function detectCountryAndApply(){
    fetch('https://ipwho.is/')
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(data && data.success !== false && data.country_code){
          setLang(data.country_code === 'RU' ? 'ru' : 'en', false);
        }
      })
      .catch(function(){ /* оставляем русский по умолчанию */ });
  }

  function init(){
    if(saved === 'ru' || saved === 'en'){
      render(saved); // человек уже выбирал язык раньше — уважаем выбор, IP не спрашиваем
    } else {
      render('ru'); // показываем сразу, пока идёт определение страны
      detectCountryAndApply();
    }
    document.querySelectorAll('.lang-switch button').forEach(function(btn){
      btn.addEventListener('click', function(){
        setLang(btn.getAttribute('data-lang'), true);
      });
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
