import type { LocalizedText } from "@template/contracts";

export const editorContent = {
  articleList: {
    eyebrow: {
      en: "Blog articles",
      ru: "Статьи блога",
      es: "Articulos del blog"
    },
    title: {
      en: "Draft, publish and archive articles from one editor.",
      ru: "Черновики, публикация и архив статей в одном редакторе.",
      es: "Borradores, publicacion y archivo en un solo editor."
    },
    signedInAs: {
      en: "Signed in as",
      ru: "Вход выполнен как",
      es: "Sesion iniciada como"
    },
    newArticle: {
      en: "New article",
      ru: "Новая статья",
      es: "Nuevo articulo"
    },
    signOut: {
      en: "Sign out",
      ru: "Выйти",
      es: "Salir"
    },
    status: {
      en: "Status",
      ru: "Статус",
      es: "Estado"
    },
    all: {
      en: "All",
      ru: "Все",
      es: "Todos"
    },
    edit: {
      en: "Edit",
      ru: "Редактировать",
      es: "Editar"
    },
    publish: {
      en: "Publish",
      ru: "Опубликовать",
      es: "Publicar"
    },
    archive: {
      en: "Archive",
      ru: "В архив",
      es: "Archivar"
    },
    delete: {
      en: "Delete",
      ru: "Удалить",
      es: "Eliminar"
    },
    loadError: {
      en: "Failed to load articles.",
      ru: "Не удалось загрузить статьи.",
      es: "No se pudieron cargar los articulos."
    }
  },
  articleEditor: {
    eyebrow: {
      en: "Blog editor",
      ru: "Редактор блога",
      es: "Editor del blog"
    },
    createTitle: {
      en: "Create new post",
      ru: "Создать новую статью",
      es: "Crear nueva publicacion"
    },
    editTitle: {
      en: "Edit post",
      ru: "Редактировать статью",
      es: "Editar publicacion"
    },
    backToArticles: {
      en: "Back to articles",
      ru: "Назад к статьям",
      es: "Volver a articulos"
    },
    posts: {
      en: "Posts",
      ru: "Статьи",
      es: "Publicaciones"
    },
    new: {
      en: "New",
      ru: "Новая",
      es: "Nueva"
    },
    noPosts: {
      en: "No posts yet.",
      ru: "Статей пока нет.",
      es: "Aun no hay publicaciones."
    },
    loading: {
      en: "Loading...",
      ru: "Загрузка...",
      es: "Cargando..."
    },
    currentStatus: {
      en: "Current status:",
      ru: "Текущий статус:",
      es: "Estado actual:"
    },
    language: {
      en: "Language",
      ru: "Язык",
      es: "Idioma"
    },
    title: {
      en: "Title",
      ru: "Заголовок",
      es: "Titulo"
    },
    excerpt: {
      en: "Excerpt",
      ru: "Краткое описание",
      es: "Extracto"
    },
    content: {
      en: "Content",
      ru: "Содержание",
      es: "Contenido"
    },
    slug: {
      en: "Slug",
      ru: "Slug",
      es: "Slug"
    },
    author: {
      en: "Author",
      ru: "Автор",
      es: "Autor"
    },
    tags: {
      en: "Tags",
      ru: "Теги",
      es: "Etiquetas"
    },
    add: {
      en: "Add",
      ru: "Добавить",
      es: "Agregar"
    },
    publishAfterSave: {
      en: "Publish after save",
      ru: "Опубликовать после сохранения",
      es: "Publicar despues de guardar"
    },
    saving: {
      en: "Saving...",
      ru: "Сохранение...",
      es: "Guardando..."
    },
    saveAndPublish: {
      en: "Save and publish",
      ru: "Сохранить и опубликовать",
      es: "Guardar y publicar"
    },
    saveDraft: {
      en: "Save draft",
      ru: "Сохранить черновик",
      es: "Guardar borrador"
    },
    publish: {
      en: "Publish",
      ru: "Опубликовать",
      es: "Publicar"
    },
    archive: {
      en: "Archive",
      ru: "В архив",
      es: "Archivar"
    },
    delete: {
      en: "Delete",
      ru: "Удалить",
      es: "Eliminar"
    },
    cancel: {
      en: "Cancel",
      ru: "Отмена",
      es: "Cancelar"
    },
    validationError: {
      en: "English title, excerpt and content are required.",
      ru: "Английские заголовок, описание и текст обязательны.",
      es: "Titulo, extracto y contenido en ingles son obligatorios."
    },
    loadArticlesError: {
      en: "Failed to load articles.",
      ru: "Не удалось загрузить статьи.",
      es: "No se pudieron cargar los articulos."
    },
    loadArticleError: {
      en: "Failed to load article.",
      ru: "Не удалось загрузить статью.",
      es: "No se pudo cargar el articulo."
    },
    saveError: {
      en: "Failed to save article.",
      ru: "Не удалось сохранить статью.",
      es: "No se pudo guardar el articulo."
    },
    publishError: {
      en: "Failed to publish article.",
      ru: "Не удалось опубликовать статью.",
      es: "No se pudo publicar el articulo."
    },
    archiveError: {
      en: "Failed to archive article.",
      ru: "Не удалось отправить статью в архив.",
      es: "No se pudo archivar el articulo."
    },
    deleteError: {
      en: "Failed to delete article.",
      ru: "Не удалось удалить статью.",
      es: "No se pudo eliminar el articulo."
    }
  },
  markdownEditor: {
    toolbarLabel: {
      en: "Markdown toolbar",
      ru: "Панель Markdown",
      es: "Barra Markdown"
    },
    placeholder: {
      en: "Write article content...",
      ru: "Напишите текст статьи...",
      es: "Escribe el contenido del articulo..."
    },
    bold: {
      en: "Bold",
      ru: "Жирный",
      es: "Negrita"
    },
    italic: {
      en: "Italic",
      ru: "Курсив",
      es: "Cursiva"
    },
    heading1: {
      en: "Heading 1",
      ru: "Заголовок 1",
      es: "Titulo 1"
    },
    heading2: {
      en: "Heading 2",
      ru: "Заголовок 2",
      es: "Titulo 2"
    },
    quote: {
      en: "Quote",
      ru: "Цитата",
      es: "Cita"
    },
    bulletList: {
      en: "Bullet list",
      ru: "Маркированный список",
      es: "Lista con vinetas"
    },
    numberedList: {
      en: "Numbered list",
      ru: "Нумерованный список",
      es: "Lista numerada"
    },
    inlineCode: {
      en: "Inline code",
      ru: "Код в строке",
      es: "Codigo en linea"
    },
    codeBlock: {
      en: "Code block",
      ru: "Блок кода",
      es: "Bloque de codigo"
    },
    link: {
      en: "Link",
      ru: "Ссылка",
      es: "Enlace"
    },
    edit: {
      en: "Edit",
      ru: "Правка",
      es: "Editar"
    },
    preview: {
      en: "Preview",
      ru: "Предпросмотр",
      es: "Vista previa"
    },
    words: {
      en: "words",
      ru: "слов",
      es: "palabras"
    },
    characters: {
      en: "characters",
      ru: "символов",
      es: "caracteres"
    }
  },
  statuses: {
    draft: {
      en: "Draft",
      ru: "Черновик",
      es: "Borrador"
    },
    published: {
      en: "Published",
      ru: "Опубликовано",
      es: "Publicado"
    },
    archived: {
      en: "Archived",
      ru: "В архиве",
      es: "Archivado"
    }
  }
} satisfies Record<string, unknown>;

export type EditorText = LocalizedText;
