/* ============================================================
   ДВУЯЗЫЧНЫЙ ПЕРЕКЛЮЧАТЕЛЬ (RU / EN)
   Как это работает:
   • Каждая страница определяет свой словарь window.TRANSLATIONS
     (объект вида {ключ: {ru: "...", en: "..."}})
   • Элементы в HTML помечены атрибутом data-i18n="ключ"
   • Этот файл при загрузке страницы и по клику на кнопку
     подставляет нужный текст и запоминает выбор в localStorage,
     поэтому язык не сбрасывается при переходе между страницами.
   Чтобы добавить новый переводимый элемент:
     1. Добавь ему data-i18n="имя_ключа"
     2. Добавь имя_ключа: {ru:"...", en:"..."} в TRANSLATIONS на странице
   ============================================================ */
(function(){
  var STORAGE_KEY = 'site-lang';
  var saved = null;
  try{ saved = localStorage.getItem(STORAGE_KEY); }catch(e){}
  var lang = saved === 'en' ? 'en' : 'ru';

  function applyLang(l){
    lang = l;
    document.documentElement.setAttribute('lang', l);

    var dict = window.TRANSLATIONS || {};
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      var entry = dict[key];
      if(entry && entry[l] !== undefined){
        el.innerHTML = entry[l];
      }
    });

    if(dict.__title && dict.__title[l]){
      document.title = dict.__title[l];
    }

    document.querySelectorAll('.lang-switch button').forEach(function(btn){
      var active = btn.getAttribute('data-lang') === l;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    try{ localStorage.setItem(STORAGE_KEY, l); }catch(e){}
  }

  function init(){
    applyLang(lang);
    document.querySelectorAll('.lang-switch button').forEach(function(btn){
      btn.addEventListener('click', function(){
        applyLang(btn.getAttribute('data-lang'));
      });
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
