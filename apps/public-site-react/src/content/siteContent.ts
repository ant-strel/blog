import type { LocaleCode, LocalizedText } from "@template/contracts";

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
  contact: {
    title: LocalizedText;
    subtitle: LocalizedText;
    otherWaysTitle: LocalizedText;
    methods: Array<{
      label: string;
      value: string;
      href: string;
    }>;
  };
}

export const siteContent: SiteContent = {
  brandName: "d-antes",
  footerText: {
    en: "(c) 2026 d-antes. Engineering notes, product thinking, and calm interfaces.",
    ru: "(c) 2026 d-antes. Заметки об инженерии, продукте и спокойных интерфейсах.",
    es: "(c) 2026 d-antes. Notas de ingenieria, producto e interfaces serenas."
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
      en: "Personal blog of a software engineer shipping products, tools, and editorial systems.",
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
      en: "Search articles",
      ru: "Поиск по статьям",
      es: "Buscar articulos"
    },
    searchPlaceholder: {
      en: "Architecture, React, product...",
      ru: "Архитектура, React, продукт...",
      es: "Arquitectura, React, producto..."
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
  contact: {
    title: {
      en: "Contacts",
      ru: "Контакты",
      es: "Contacto"
    },
    subtitle: {
      en: "No forms here. Reach out through direct links so the page stays lightweight and does not collect personal data.",
      ru: "Без форм обратной связи. Только прямые ссылки, чтобы страница оставалась легкой и не собирала персональные данные.",
      es: "Sin formularios. Solo enlaces directos para mantener la pagina ligera y sin recopilacion de datos personales."
    },
    otherWaysTitle: {
      en: "Direct channels",
      ru: "Прямые каналы связи",
      es: "Canales directos"
    },
    methods: [
      {
        label: "Email",
        value: "hello@d-antes.dev",
        href: "mailto:hello@d-antes.dev"
      },
      {
        label: "GitHub",
        value: "github.com/d-antes",
        href: "https://github.com/d-antes"
      },
      {
        label: "LinkedIn",
        value: "linkedin.com/in/d-antes",
        href: "https://www.linkedin.com/in/d-antes"
      },
      {
        label: "Telegram",
        value: "t.me/dantes_dev",
        href: "https://t.me/dantes_dev"
      },
      {
        label: "Signal",
        value: "signal.me/#eu/dantes-dev",
        href: "https://signal.me/#eu/dantes-dev"
      },
      {
        label: "X / Twitter",
        value: "x.com/dantes_dev",
        href: "https://x.com/dantes_dev"
      }
    ]
  }
};
