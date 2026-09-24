import type { LocaleCode } from "@template/contracts";
import { Seo } from "../components/Seo";

const copy = {
  ru: ["Приватность", "Сайт не устанавливает cookies, не использует аналитику, рекламные трекеры и постоянное хранилище браузера. Поиск работает на устройстве. Выбор языка и темы сохраняется только до перезагрузки страницы.", "Тексты и оформление загружаются с того же сайта. Внешние сервисы открываются только при переходе по контактной ссылке и имеют собственные правила приватности.", "При подключении сервер получает IP-адрес и параметры HTTP-запроса. Настройки журналов хостинга и прокси проверяются отдельно от исходного кода сайта.", "Открытый исходный код"],
  en: ["Privacy", "This site sets no cookies and uses no analytics, advertising trackers, or persistent browser storage. Search runs on your device. Language and theme choices last until the page is reloaded.", "Content and styling load from this site. External services open only when you follow a contact link and have their own privacy policies.", "The server receives your IP address and HTTP request details when you connect. Hosting and proxy logging settings must be reviewed separately from the site source code.", "Open source code"],
  es: ["Privacidad", "Este sitio no establece cookies ni utiliza analitica, rastreadores publicitarios o almacenamiento persistente. La busqueda se ejecuta en su dispositivo. El idioma y el tema duran hasta recargar la pagina.", "El contenido y los estilos se cargan desde este sitio. Los servicios externos se abren al seguir un enlace de contacto y tienen sus propias politicas.", "Al conectarse, el servidor recibe su direccion IP y los datos de la solicitud HTTP. Los registros del alojamiento y del proxy se revisan por separado del codigo fuente.", "Codigo abierto"]
};

export function PrivacyPage({ locale }: { locale: LocaleCode }) {
  const [title, ...paragraphs] = copy[locale];
  return <article className="blog-post-full">
    <Seo title={title + " | d-antes"} description={paragraphs[0]} path="/privacy" locale={locale} />
    <h1>{title}</h1>
    {paragraphs.slice(0, 3).map(text => <p key={text}>{text}</p>)}
    <a href="https://github.com/ant-strel/blog" rel="noreferrer">{paragraphs[3]}</a>
  </article>;
}
