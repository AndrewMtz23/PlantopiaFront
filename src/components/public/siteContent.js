const remoteImages = {
  heroMain:
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=85",
  heroSecondary:
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=85",
  collectionIndoor:
    "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=85",
  collectionDesert:
    "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=1200&q=85",
  collectionGift:
    "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1200&q=85",
  lifestyle:
    "https://images.unsplash.com/photo-1483794344563-d27a8d18014e?auto=format&fit=crop&w=1400&q=85",
  greenhouse:
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1400&q=85",
  careGuide:
    "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1400&q=85",
  delivery:
    "https://images.unsplash.com/photo-1524593166156-312f362cada0?auto=format&fit=crop&w=1400&q=85",
  team:
    "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1400&q=85",
};

const homeCollections = [
  {
    title: "Selva Interior",
    copy: "Follajes escultoricos, macetas limpias y piezas que levantan cualquier sala.",
    tag: "Best seller",
    to: "/colecciones",
    image: remoteImages.collectionIndoor,
  },
  {
    title: "Rincon Desierto",
    copy: "Suculentas, cactus y especies faciles para espacios con mucha luz.",
    tag: "Bajo mantenimiento",
    to: "/cuidados",
    image: remoteImages.collectionDesert,
  },
  {
    title: "Regalos Vivos",
    copy: "Selecciones listas para sorprender con empaque bonito y mensaje especial.",
    tag: "Regalable",
    to: "/regalos-botanicos",
    image: remoteImages.collectionGift,
  },
];

const trustHighlights = [
  {
    value: "48h",
    label: "Entrega agil",
    copy: "Despachos cuidados para que tus plantas lleguen listas para lucirse.",
  },
  {
    value: "Top",
    label: "Curaduria real",
    copy: "No vendemos relleno: elegimos especies con presencia y personalidad.",
  },
  {
    value: "Pro",
    label: "Asesoria humana",
    copy: "Te ayudamos a elegir segun luz, espacio y ritmo de vida.",
  },
];

const testimonials = [
  {
    name: "Mariana S.",
    role: "Cliente frecuente",
    quote:
      "Se siente como una tienda que entiende estetica y cuidado. Compre una coleccion completa para mi estudio y llego impecable.",
  },
  {
    name: "Ernesto V.",
    role: "Comprador mayorista",
    quote:
      "Lo mejor fue la orientacion. Me recomendaron piezas con rotacion real y se nota que no te quieren vender por vender.",
  },
  {
    name: "Carla R.",
    role: "Regalos corporativos",
    quote:
      "La seleccion de regalos botanicos nos resolvio un evento entero y se vio premium desde el primer momento.",
  },
];

const aboutValues = [
  {
    title: "Curaduria con criterio",
    copy: "Seleccionamos plantas y accesorios por presencia, facilidad de cuidado y valor decorativo real.",
  },
  {
    title: "Compra con contexto",
    copy: "Explicamos luz, riego y combinaciones para que compres bien desde la primera vez.",
  },
  {
    title: "Experiencia viva",
    copy: "Plantopia no quiere ser solo catalogo; quiere convertirse en una referencia visual y funcional.",
  },
];

const companyCapabilities = [
  {
    title: "Retail botanico",
    copy: "Colecciones para hogar, oficina, regalos y compras estacionales con direccion visual clara.",
  },
  {
    title: "Atencion consultiva",
    copy: "Ayudamos a armar pedidos segun presupuesto, tipo de espacio y dificultad de mantenimiento.",
  },
  {
    title: "Escalabilidad comercial",
    copy: "Hay espacio para mayoristas, regalos corporativos y experiencias de suscripcion verde.",
  },
];

const faqItems = [
  {
    question: "Que pasa si no se nada de plantas?",
    answer:
      "Ese es justo el punto. La nueva experiencia publica esta pensada para guiarte por estilo, dificultad y tipo de espacio, no solo por nombre botanico.",
  },
  {
    question: "Puedo comprar para regalar?",
    answer:
      "Si. Ya dejamos una ruta estatica de regalos botanicos y se puede extender despues a empaques, mensajes y bundles especiales.",
  },
  {
    question: "Como saber si una planta es para mi casa?",
    answer:
      "Estamos separando contenido de colecciones y cuidados para que filtres por luz, mantenimiento y ambiente antes de entrar al catalogo.",
  },
  {
    question: "Hacen envios y compras por volumen?",
    answer:
      "Si. El sitio ya comunica ventas por volumen, regalos corporativos y una futura pagina de envios con proceso mas claro.",
  },
];

export {
  aboutValues,
  companyCapabilities,
  faqItems,
  homeCollections,
  remoteImages,
  testimonials,
  trustHighlights,
};
