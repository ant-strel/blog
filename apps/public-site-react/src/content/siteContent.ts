import type { LocaleCode, LocalizedText } from "@template/contracts";
import contactContent from "./contactContent.json";

export interface SiteContent {
  brandName: string;
  footerText: LocalizedText;
  nav: {
    home: LocalizedText;
    blog: LocalizedText;
    contact: LocalizedText;
  };
  languageLabel: LocalizedText;
  languages: Record<LocaleCode, string>;
  home: {
    title: LocalizedText;
    subtitle: LocalizedText;
    blogCta: LocalizedText;
    contactCta: LocalizedText;
  };
  blog: {
    title: LocalizedText;
    subtitle: LocalizedText;
    loading: LocalizedText;
    continueReading: LocalizedText;
    previous: LocalizedText;
    next: LocalizedText;
    tagsLabel: LocalizedText;
    searchLabel: LocalizedText;
    searchPlaceholder: LocalizedText;
    searchSubmit: LocalizedText;
    searchEmpty: LocalizedText;
  };
  article: {
    loading: LocalizedText;
    notFound: LocalizedText;
    backToBlog: LocalizedText;
    backToAllPosts: LocalizedText;
  };
  contact: typeof contactContent;
}

export const siteContent: SiteContent = {
  brandName: "d-antes",
  footerText: {
    en: "Anton Strelnikov (d-antes). Journals. Archives. Notes.\nNo cookies or trackers.",
    ru: "Антон Стрельников (d-antes) Дневники. Архивы. Заметки. \n Никаких кук и трекеров.",
    es: "Anton Strelnikov (d-antes). Diarios. Archivos. Notas.\nSin cookies ni rastreadores."
  },
  nav: {
    home: {
      en: "Home",
      ru: "Главная",
      es: "Inicio"
    },
    blog: {
      en: "Blog",
      ru: "Блог",
      es: "Blog"
    },
    contact: {
      en: "Contacts",
      ru: "Контакты",
      es: "Contacto"
    }
  },
  languageLabel: {
    en: "Language:",
    ru: "Язык:",
    es: "Idioma:"
  },
  languages: {
    en: "English",
    ru: "Русский",
    es: "Espanol"
  },
  home: {
    title: {
      en: "",
      ru: "Персональный блог разработчика о продакшене, инструментах и редакционных системах.",
      es: "Blog personal de un ingeniero de software que entrega productos, herramientas y sistemas editoriales."
    },
    subtitle: {
      en: "The homepage now reads like a lead article: fewer slogans, more signal about architecture, writing discipline, and how ideas make it into production.",
      ru: "Главная теперь работает как вводная статья: меньше лозунгов, больше сигнала про архитектуру, дисциплину письма и путь идей до продакшена.",
      es: "La portada ahora funciona como un articulo principal: menos consignas y mas senal sobre arquitectura, disciplina editorial y paso a produccion."
    },
    blogCta: {
      en: "Read the blog",
      ru: "Читать блог",
      es: "Leer el blog"
    },
    contactCta: {
      en: "Open contacts",
      ru: "Открыть контакты",
      es: "Abrir contacto"
    }
  },
  blog: {
    title: {
      en: "Blog",
      ru: "Блог",
      es: "Blog"
    },
    subtitle: {
      en: "Articles, field notes, launch retrospectives, and decisions made in public.",
      ru: "Статьи, полевые заметки, ретроспективы запусков и решения, принятые публично.",
      es: "Articulos, notas de campo, retrospectivas de lanzamientos y decisiones tomadas en publico."
    },
    loading: {
      en: "Loading blog posts...",
      ru: "Загрузка статей...",
      es: "Cargando articulos..."
    },
    continueReading: {
      en: "Continue reading",
      ru: "Читать дальше",
      es: "Seguir leyendo"
    },
    previous: {
      en: "Previous",
      ru: "Назад",
      es: "Anterior"
    },
    next: {
      en: "Next",
      ru: "Вперед",
      es: "Siguiente"
    },
    tagsLabel: {
      en: "tags",
      ru: "теги",
      es: "etiquetas"
    },
    searchLabel: {
      en: "Search",
      ru: "Поиск",
      es: "Buscar"
    },
    searchPlaceholder: {
      en: "...",
      ru: "...",
      es: "..."
    },
    searchSubmit: {
      en: "Search",
      ru: "Искать",
      es: "Buscar"
    },
    searchEmpty: {
      en: "No articles match this query.",
      ru: "По этому запросу статей не найдено.",
      es: "No hay articulos para esta busqueda."
    }
  },
  article: {
    loading: {
      en: "Loading article...",
      ru: "Загрузка статьи...",
      es: "Cargando articulo..."
    },
    notFound: {
      en: "Article not found.",
      ru: "Статья не найдена.",
      es: "Articulo no encontrado."
    },
    backToBlog: {
      en: "Back to blog",
      ru: "Вернуться в блог",
      es: "Volver al blog"
    },
    backToAllPosts: {
      en: "Back to all posts",
      ru: "Все статьи",
      es: "Todos los articulos"
    }
  },
  contact: contactContent
};
