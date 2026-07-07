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
    nameLabel: LocalizedText;
    namePlaceholder: LocalizedText;
    emailLabel: LocalizedText;
    emailPlaceholder: LocalizedText;
    messageLabel: LocalizedText;
    messagePlaceholder: LocalizedText;
    submitLabel: LocalizedText;
    sentStatus: LocalizedText;
    otherWaysTitle: LocalizedText;
    methods: Array<{
      label: string;
      value: string;
      href?: string;
    }>;
  };
}

export const siteContent: SiteContent = {
  brandName: "Template Project",
  footerText: {
    en: "(c) 2026 Template Project",
    ru: "(c) 2026 Template Project",
    es: "(c) 2026 Template Project"
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
      en: "Contact",
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
    es: "Español"
  },
  home: {
    title: {
      en: "Minimal blog surface with a protected editor.",
      ru: "Минималистичный блог с закрытым редактором.",
      es: "Blog minimalista con editor protegido."
    },
    subtitle: {
      en: "Public articles stay quiet and readable. Drafting, publishing and archive management live in the authenticated editorial area.",
      ru: "Публичные статьи остаются спокойными и удобными для чтения. Черновики, публикация и архив управляются в закрытой редакторской зоне.",
      es: "Los artículos públicos son limpios y legibles. Los borradores, la publicación y el archivo se gestionan en el área editorial autenticada."
    },
    blogCta: {
      en: "Open blog",
      ru: "Открыть блог",
      es: "Abrir blog"
    },
    contactCta: {
      en: "Contact",
      ru: "Контакты",
      es: "Contacto"
    }
  },
  blog: {
    title: {
      en: "Blog",
      ru: "Блог",
      es: "Blog"
    },
    subtitle: {
      en: "Articles, notes and product updates.",
      ru: "Статьи, заметки и обновления проекта.",
      es: "Artículos, notas y actualizaciones del proyecto."
    },
    loading: {
      en: "Loading blog posts...",
      ru: "Загрузка статей...",
      es: "Cargando artículos..."
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
      ru: "Вперёд",
      es: "Siguiente"
    },
    tagsLabel: {
      en: "tags",
      ru: "теги",
      es: "etiquetas"
    }
  },
  article: {
    loading: {
      en: "Loading article...",
      ru: "Загрузка статьи...",
      es: "Cargando artículo..."
    },
    notFound: {
      en: "Article not found.",
      ru: "Статья не найдена.",
      es: "Artículo no encontrado."
    },
    backToBlog: {
      en: "Back to blog",
      ru: "Вернуться в блог",
      es: "Volver al blog"
    },
    backToAllPosts: {
      en: "Back to all posts",
      ru: "Все статьи",
      es: "Todos los artículos"
    }
  },
  contact: {
    title: {
      en: "Contact",
      ru: "Контакты",
      es: "Contacto"
    },
    subtitle: {
      en: "Use the form or reach out through the usual channels.",
      ru: "Используйте форму или свяжитесь через привычные каналы.",
      es: "Usa el formulario o escribe por los canales habituales."
    },
    nameLabel: {
      en: "Name",
      ru: "Имя",
      es: "Nombre"
    },
    namePlaceholder: {
      en: "Your name",
      ru: "Ваше имя",
      es: "Tu nombre"
    },
    emailLabel: {
      en: "Email",
      ru: "Email",
      es: "Email"
    },
    emailPlaceholder: {
      en: "your.email@example.com",
      ru: "your.email@example.com",
      es: "your.email@example.com"
    },
    messageLabel: {
      en: "Message",
      ru: "Сообщение",
      es: "Mensaje"
    },
    messagePlaceholder: {
      en: "Write your message",
      ru: "Напишите сообщение",
      es: "Escribe tu mensaje"
    },
    submitLabel: {
      en: "Send message",
      ru: "Отправить",
      es: "Enviar"
    },
    sentStatus: {
      en: "Message draft cleared.",
      ru: "Черновик сообщения очищен.",
      es: "Borrador del mensaje limpiado."
    },
    otherWaysTitle: {
      en: "Other ways",
      ru: "Другие способы связи",
      es: "Otros canales"
    },
    methods: [
      {
        label: "Email",
        value: "your.email@example.com"
      },
      {
        label: "LinkedIn",
        value: "linkedin.com/in/yourprofile",
        href: "https://linkedin.com/in/yourprofile"
      },
      {
        label: "GitHub",
        value: "github.com/yourusername",
        href: "https://github.com/yourusername"
      }
    ]
  }
};
