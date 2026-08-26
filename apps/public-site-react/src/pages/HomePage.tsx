import { Link } from "react-router-dom";
import type { LocaleCode, LocalizedText } from "@template/contracts";
import { Seo } from "../components/Seo";
import { siteContent } from "../content/siteContent";
import { localize } from "../lib/localize";
import { blogIndexPath } from "../lib/blogRoutes";

export function HomePage({ locale }: { locale: LocaleCode }) {
  return (
    <div className="home-page">
      <Seo
        title="d-antes"
        description={localize(siteContent.home.subtitle, locale)}
        path="/"
        locale={locale}
      />

      <section className="home-intro">
        <p className="home-eyebrow">{localize(homeContent.eyebrow, locale)}</p>
        <h1>{localize(siteContent.home.title, locale)}</h1>
        <p>{localize(siteContent.home.subtitle, locale)}</p>
        <div className="home-actions">
          <Link className="btn btn-primary" to={blogIndexPath}>
            {localize(siteContent.home.blogCta, locale)}
          </Link>
          <Link className="btn btn-outline" to="/contact">
            {localize(siteContent.home.contactCta, locale)}
          </Link>
        </div>
      </section>

      <section className="feature-article">
        <div className="feature-article-header">
          <div>
            <p className="feature-meta">{localize(homeContent.articleMeta, locale)}</p>
            <h2 className="feature-title">{localize(homeContent.articleTitle, locale)}</h2>
          </div>
          <div className="feature-stat-block">
            {featureStats.map((stat) => (
              <div className="feature-stat" key={stat.value.en}>
                <span className="feature-stat-value">{localize(stat.value, locale)}</span>
                <span className="feature-stat-label">{localize(stat.label, locale)}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="feature-lead">{localize(homeContent.articleLead, locale)}</p>

        <div className="feature-article-grid">
          <div className="feature-body">
            {articleSections.map((section) => (
              <section className="article-section" key={section.title.en}>
                <h3>{localize(section.title, locale)}</h3>
                <p>{localize(section.body, locale)}</p>
              </section>
            ))}
          </div>

          <aside className="feature-sidebar">
            <div className="sidebar-card">
              <h3>{localize(homeContent.sidebarHighlightsTitle, locale)}</h3>
              <ul className="sidebar-list">
                {articleHighlights.map((item) => (
                  <li key={item.en}>{localize(item, locale)}</li>
                ))}
              </ul>
            </div>

            <div className="sidebar-card">
              <h3>{localize(homeContent.sidebarStackTitle, locale)}</h3>
              <div className="topic-list">
                {techTopics.map((topic) => (
                  <span className="topic-pill" key={topic}>
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="home-panels">
        {homePanels.map((panel) => (
          <article className="home-panel" key={panel.title.en}>
            <p className="home-panel-kicker">{localize(panel.kicker, locale)}</p>
            <h3>{localize(panel.title, locale)}</h3>
            <p>{localize(panel.body, locale)}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

type LocalizedItem = {
  en: string;
  ru: string;
  es: string;
};

type Section = {
  title: LocalizedItem;
  body: LocalizedItem;
};

type Panel = {
  kicker: LocalizedItem;
  title: LocalizedItem;
  body: LocalizedItem;
};

const homeContent: Record<string, LocalizedText> = {
  eyebrow: {
    en: "Homepage demo article",
    ru: "Демо-статья для главной",
    es: "Articulo demo para la portada"
  },
  articleMeta: {
    en: "Lead story / July 2026 / 8 min read",
    ru: "Главный материал / июль 2026 / 8 минут",
    es: "Historia principal / julio 2026 / 8 min"
  },
  articleTitle: {
    en: "Shipping a personal engineering blog that reads like a working notebook, not a landing page.",
    ru: "Как сделать персональный инженерный блог, который читается как рабочий блокнот, а не как лендинг.",
    es: "Como lanzar un blog personal de ingenieria que se lea como un cuaderno de trabajo y no como una landing."
  },
  articleLead: {
    en: "This front page is intentionally editorial. It introduces the blog through a concrete narrative about systems, writing, and product judgment instead of generic self-presentation.",
    ru: "Эта главная намеренно собрана как редакционный материал. Она знакомит с блогом через конкретный рассказ о системах, письме и продуктовых решениях, а не через шаблонную самопрезентацию.",
    es: "Esta portada es deliberadamente editorial. Presenta el blog con una narrativa concreta sobre sistemas, escritura y criterio de producto en lugar de una presentacion generica."
  },
  sidebarHighlightsTitle: {
    en: "What the reader gets",
    ru: "Что получает читатель",
    es: "Que obtiene el lector"
  },
  sidebarStackTitle: {
    en: "Topics on deck",
    ru: "Темы на борту",
    es: "Temas en cola"
  }
};

const featureStats = [
  {
    value: {
      en: "3 tracks",
      ru: "3 трека",
      es: "3 lineas"
    },
    label: {
      en: "product, code, writing",
      ru: "продукт, код, письмо",
      es: "producto, codigo, escritura"
    }
  },
  {
    value: {
      en: "0 fluff",
      ru: "0 воды",
      es: "0 relleno"
    },
    label: {
      en: "only shipped lessons",
      ru: "только практический опыт",
      es: "solo lecciones aplicadas"
    }
  }
] satisfies Array<{ value: LocalizedItem; label: LocalizedItem }>;

const articleSections: Section[] = [
  {
    title: {
      en: "The site behaves like an editorial desk",
      ru: "Сайт ведет себя как редакционный стол",
      es: "El sitio funciona como una mesa editorial"
    },
    body: {
      en: "Public pages stay quiet and legible, while the protected area handles drafting, publication flow, and archive management. That split matters because writing quality usually drops when the CMS leaks into the reading experience.",
      ru: "Публичные страницы остаются тихими и удобными для чтения, а закрытая зона берет на себя черновики, публикацию и архив. Это важно, потому что качество чтения почти всегда падает, когда CMS начинает просвечивать в публичном интерфейсе.",
      es: "Las paginas publicas siguen limpias y legibles, mientras la zona protegida resuelve borradores, publicacion y archivo. Esa separacion importa porque la experiencia de lectura empeora cuando el CMS se filtra a la parte publica."
    }
  },
  {
    title: {
      en: "Posts focus on decisions, not announcements",
      ru: "Посты строятся вокруг решений, а не анонсов",
      es: "Los textos se centran en decisiones, no en anuncios"
    },
    body: {
      en: "The strongest technical blogs explain why one tradeoff survived and another was rejected. That is the format this homepage previews: architecture notes, migration stories, performance cleanups, and interface rationale with enough context to be reusable.",
      ru: "Сильные технические блоги объясняют, почему один компромисс остался, а другой был отброшен. Именно такой формат и анонсирует эта главная: заметки по архитектуре, истории миграций, оптимизации производительности и аргументация по интерфейсам с достаточным контекстом для повторного использования.",
      es: "Los mejores blogs tecnicos explican por que sobrevivio una compensacion y otra fue descartada. Ese es el formato que adelanta esta portada: notas de arquitectura, migraciones, mejoras de rendimiento y criterio de interfaz con contexto reutilizable."
    }
  },
  {
    title: {
      en: "Contact paths are direct by design",
      ru: "Контакты сделаны прямыми по замыслу",
      es: "Los canales de contacto son directos por diseno"
    },
    body: {
      en: "The contact page avoids forms and consent plumbing. Instead, it lists the real channels where collaboration actually happens: mail, GitHub, LinkedIn, and messengers. Less ceremony, less compliance overhead, and fewer dead inboxes.",
      ru: "Страница контактов специально обходится без форм и сопутствующей юридической обвязки. Вместо этого она перечисляет реальные каналы, где и происходит общение: почта, GitHub, LinkedIn и мессенджеры. Меньше церемонии, меньше compliance-нагрузки и меньше мертвых инбоксов.",
      es: "La pagina de contacto evita formularios y la capa de consentimiento. En su lugar enumera los canales reales donde ocurre la colaboracion: correo, GitHub, LinkedIn y mensajeria. Menos ceremonia, menos carga legal y menos bandejas muertas."
    }
  }
];

const articleHighlights: LocalizedItem[] = [
  {
    en: "Readable long-form writing instead of generic portfolio copy.",
    ru: "Читаемые длинные тексты вместо типового портфолио-копирайта.",
    es: "Textos largos y legibles en lugar de copia generica de portafolio."
  },
  {
    en: "A homepage that already demonstrates tone, structure, and technical depth.",
    ru: "Главная, которая сразу показывает тон, структуру и техническую глубину.",
    es: "Una portada que ya demuestra tono, estructura y profundidad tecnica."
  },
  {
    en: "Direct contact links without collecting visitor messages on-site.",
    ru: "Прямые контактные ссылки без сбора сообщений на самом сайте.",
    es: "Enlaces directos sin recopilar mensajes dentro del sitio."
  }
];

const techTopics = ["TypeScript", "React", "Editorial UX", "APIs", "Platform work", "Notes"];

const homePanels: Panel[] = [
  {
    kicker: {
      en: "Writing practice",
      ru: "Практика письма",
      es: "Practica editorial"
    },
    title: {
      en: "Essays with implementation detail",
      ru: "Эссе с деталями реализации",
      es: "Ensayos con detalle de implementacion"
    },
    body: {
      en: "The public layer should invite reading, not merely route traffic to a CV. That is why the homepage now behaves like the first article in an ongoing series.",
      ru: "Публичный слой должен приглашать к чтению, а не просто перегонять трафик в резюме. Поэтому главная теперь ведет себя как первая статья в продолжающейся серии.",
      es: "La capa publica debe invitar a leer y no solo a redirigir trafico a un CV. Por eso la portada se comporta como el primer articulo de una serie."
    }
  },
  {
    kicker: {
      en: "Engineering taste",
      ru: "Инженерный вкус",
      es: "Criterio de ingenieria"
    },
    title: {
      en: "Calm UI with explicit tradeoffs",
      ru: "Спокойный UI с явными компромиссами",
      es: "UI serena con compensaciones explicitas"
    },
    body: {
      en: "The layout stays restrained, but the content is not vague. The page explains what is built here, how it is maintained, and what kind of collaboration makes sense.",
      ru: "Верстка остается сдержанной, но содержание не расплывчатое. Страница объясняет, что здесь создается, как это поддерживается и какой тип сотрудничества вообще имеет смысл.",
      es: "La composicion sigue contenida, pero el contenido no es vago. La pagina explica que se construye aqui, como se mantiene y que tipo de colaboracion tiene sentido."
    }
  },
  {
    kicker: {
      en: "Editorial pipeline",
      ru: "Редакционный пайплайн",
      es: "Flujo editorial"
    },
    title: {
      en: "Protected tools, public reading surface",
      ru: "Закрытые инструменты, публичная поверхность чтения",
      es: "Herramientas protegidas y superficie publica de lectura"
    },
    body: {
      en: "Drafting and admin workflows remain behind authentication while the front page keeps a single job: establish credibility through thoughtful writing and clear links.",
      ru: "Черновики и админские сценарии остаются за авторизацией, а у главной остается одна задача: создавать доверие через продуманное письмо и ясные ссылки.",
      es: "Los borradores y flujos administrativos quedan detras de la autenticacion, mientras la portada mantiene una sola tarea: generar credibilidad con buena escritura y enlaces claros."
    }
  }
];
