/* Каталог для главной. Источник — 03_Тексты_сайта_каталог_и_карточки_курсов_2026-10-07.md.
   level: zero — без требований к образованию, spec — нужно высшее или среднее профобразование,
          med — нужно медицинское образование.
   format: ochno — группа/мини-группа, ind — индивидуально, dist — дистанционно.
   price: число в рублях или null («по запросу»); from: true — «от». */
window.COURSES = [
  // Очно — приоритетные аппаратные (индивидуально)
  { t: "Микроигольчатый RF-лифтинг", url: "kursy/mikroigolchatyj-rf-lifting/", d: "Подбор глубины и мощности под зону и тип кожи. Отработка на модели.", dir: "face", format: "ind", level: "spec", hours: "12 ч", price: 55000, img: "c06.jpg" },
  { t: "SMAS-лифтинг", d: "Ультразвуковой лифтинг глубоких слоёв: овал, брыли, второй подбородок.", dir: "face", format: "ind", level: "spec", hours: "16 ч", price: 55000, img: "c07.jpg" },
  { t: "Диодная лазерная эпиляция", d: "Фототипы, параметры, безопасность и курс процедур для клиента.", dir: "laser", format: "ind", level: "spec", hours: "12 ч", price: 45000, img: "c15.jpg" },
  { t: "Карбоновый пилинг и удаление тату", d: "Неодимовый пикосекундный лазер: чистка пор и удаление пигмента.", dir: "laser", format: "ochno", level: "spec", hours: "мини-группа", price: 25000, img: "c19.jpg" },
  { t: "Химические пилинги и чистки", d: "Подбор кислот под задачу, подготовка кожи и восстановление.", dir: "esth", format: "ind", level: "spec", hours: "12 ч", price: 45000, img: "c21.jpg" },
  { t: "Криолиполиз", d: "Выбор зоны, аппликатора и времени воздействия. Безопасный протокол.", dir: "body", format: "ind", level: "spec", hours: "12 ч", price: null, img: "c09.jpg" },
  // Очно — группы
  { t: "Косметик-эстетист по лицу в мини-группе", url: "kursy/kosmetik-estetist-po-licu-v-mini-gruppe/", d: "Профессия с нуля: чистки, пилинги, аппаратные уходы, массаж лица. Мини-группа из 6 человек.", dir: "esth", format: "ochno", level: "zero", hours: "320 ак. ч", price: 45000, img: "c04.jpg" },
  { t: "Сестринское дело в косметологии", url: "kursy/sestrinskoe-delo-v-kosmetologii-ochno/", d: "Для медсестёр, фельдшеров и акушерок: манипуляции, мезотерапия, пилинги. Практика на моделях, диплом.", dir: "med", format: "ochno", level: "med", hours: "504 ак. ч", price: 75000, img: "c36-sestrinskoe-ochno.jpg" },
  { t: "Инъекционная косметология", url: "kursy/inekcionnaya-kosmetologiya-ochno/", d: "Для врачей: мезотерапия, контурная пластика, ботулинотерапия. 500 ч практики на моделях.", dir: "inj", format: "ochno", level: "med", hours: "576 ак. ч", price: 110000, from: true, img: "c01.jpg" },
  { t: "Архитектор лица: канюльная техника", url: "kursy/arhitektor-lica-kanyulnaya-tehnika/", d: "Повышение квалификации для инъекционистов: безопасная работа канюлей.", dir: "inj", format: "ochno", level: "med", hours: "72 ак. ч", price: 75000, img: "c17.jpg" },
  { t: "Лечение гипергидроза ботулотоксином", url: "kursy/lechenie-gipergidroza-botulotoksinom/", d: "Диагностика, разметка, расчёт дозировки. Процедура на модели.", dir: "inj", format: "ochno", level: "med", hours: "72 ак. ч", price: 55000, img: "c12.jpg" },
  { t: "Мастер перманентного макияжа", url: "kursy/master-permanentnogo-makiyazha/", d: "Брови, губы и веки с нуля: эскиз, колористика, практика на моделях.", dir: "beauty", format: "ochno", level: "zero", hours: "250 ак. ч", price: 60000, from: true, img: "c05.jpg" },
  { t: "Архитектура взгляда и ламинирование", d: "Ламинирование бровей и ресниц, коррекция и окрашивание за один день.", dir: "beauty", format: "ochno", level: "zero", hours: "1 день", price: 25000, img: "c18.jpg" },
  // Дистанционно
  { t: "Косметик-эстетист по лицу", url: "kursy/kosmetik-estetist-po-licu-distancionno/", d: "Кожа, диагностика, средства, чистки, маски, пилинги. В своём темпе.", dir: "esth", format: "dist", level: "zero", hours: "320 ак. ч", price: 22800, img: "c08.jpg" },
  { t: "Косметик-эстетист по телу", url: "kursy/kosmetik-estetist-po-telu-distancionno/", d: "Кожа тела, целлюлит, питание, программы коррекции фигуры, депиляция.", dir: "esth", format: "dist", level: "zero", hours: "320 ак. ч", price: 22800, img: "c24.jpg" },
  { t: "Лазерные технологии и IPL-терапия", url: "kursy/lazernye-tehnologii-i-ipl-distancionno/", d: "Повышение квалификации для врачей: лазеры, IPL и фракционный CO2-лазер. Удостоверение, ФИС ФРДО.", dir: "laser", format: "dist", level: "med", hours: "50 ак. ч", price: 22800, img: "c30-laser-dist.jpg" },
  { t: "Аппаратные методики по коррекции фигуры", url: "kursy/apparatnye-metodiki-korrekcii-figury-distancionno/", d: "Кавитация, криолиполиз, RF, вакуумный массаж, прессотерапия. Удостоверение, ФИС ФРДО.", dir: "body", format: "dist", level: "med", hours: "50 ак. ч", price: 22800, img: "c35-figura-dist.jpg" },
  { t: "Младшая медицинская сестра", url: "kursy/mladshaya-medicinskaya-sestra-distancionno/", d: "Уход за пациентами, санитарные нормы, первая помощь. С нуля.", dir: "med", format: "dist", level: "zero", hours: "304 ак. ч", price: 22800, img: "c25.jpg" },
  { t: "Наращивание ресниц", url: "kursy/narashchivanie-resnic-distancionno/", d: "Техники наращивания, подбор материалов, коррекция и безопасное снятие.", dir: "beauty", format: "dist", level: "zero", hours: "108 ак. ч", price: null, img: "c27-lashes.jpg" },
  { t: "Маникюр, педикюр и наращивание", url: "kursy/master-manikyura-pedikyura-distancionno/", d: "Гигиена, покрытие, наращивание и дизайн. Анатомия ногтя и санитарные нормы.", dir: "beauty", format: "dist", level: "zero", hours: "108 ак. ч", price: null, img: "c26-nails.jpg" },
  { t: "Красивый бизнес в косметологии", url: "kursy/krasivyj-biznes/", d: "Как открыть кабинет: документы, лицензия, финансы, команда, маркетинг.", dir: "biz", format: "dist", level: "zero", hours: "250 ак. ч", price: 52000, img: "c31-biznes-julia.jpg" },
  { t: "Тренер в косметологии", url: "kursy/trener-v-kosmetologii/", d: "Для практиков, которые хотят преподавать: программа, занятие, практика.", dir: "biz", format: "dist", level: "spec", hours: "250 ак. ч", price: 52000, img: "c28-trainer.jpg" }
];

window.DIRS = {
  face: "Лицо · аппарат",
  laser: "Лазер и IPL",
  body: "Тело",
  esth: "Эстетика",
  inj: "Инъекции",
  med: "Медицина",
  beauty: "Перманент, брови, ногти",
  biz: "Бизнес и преподавание"
};
