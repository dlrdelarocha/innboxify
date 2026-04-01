export default {
  nav: {
    dashboard: 'Panel',
    filters: 'Filtros',
    settings: 'Ajustes',
    logout: 'Cerrar sesión'
  },
  login: {
    title: 'Inboxly',
    subtitle: 'Gestiona, clasifica y limpia tu bandeja de entrada con inteligencia artificial',
    signIn: 'Iniciar sesión con Google',
    features: {
      classify: 'Clasifica remitentes con IA',
      filters: 'Crea filtros de Gmail',
      unsubscribe: 'Cancela suscripciones fácilmente',
      clean: 'Limpia tu bandeja masivamente'
    }
  },
  dashboard: {
    title: 'Remitentes',
    loading: 'Cargando emails...',
    fetchingIds: 'Obteniendo lista de emails: {count} encontrados...',
    fetchingMetadata: 'Descargando metadatos: {current} de {total}',
    classifying: 'Clasificando con IA: {current} de {total}',
    noEmails: 'No se encontraron emails',
    refresh: 'Actualizar',
    classify: 'Clasificar con IA',
    search: 'Buscar remitente o dominio...',
    filterCategory: 'Todas las categorías',
    allCategories: 'Todos',
    manageSenders: 'Gestiona {count} remitentes únicos',
    showingSenders: 'Mostrando {count} remitentes',
    stats: {
      totalSenders: 'Total Remitentes',
      totalEmails: 'Total Emails',
      classified: 'Clasificados',
      topDomain: 'Top Dominio'
    },
    sync: {
      fetchingIds: 'Buscando emails... {count} encontrados',
      fetchingMetadata: 'Sincronizando: {detail} ({percent}%)',
      complete: 'Sincronización completa'
    },
    table: {
      sender: 'Remitente',
      domain: 'Dominio',
      category: 'Categoría',
      count: 'Emails',
      unsubscribe: 'Desuscribir',
      actions: 'Acciones'
    },
    actions: {
      deleteAll: 'Eliminar todos',
      block: 'Bloquear',
      createFilter: 'Crear filtro',
      unsubAuto: 'Desuscribir (auto)',
      unsubManual: 'Desuscribir (manual)',
      noUnsub: 'No disponible'
    },
    confirmDelete: '¿Eliminar {count} emails de {sender}?',
    confirmBlock: '¿Bloquear a {sender}? Sus emails futuros irán a la papelera.',
    deleted: '{count} emails eliminados',
    blocked: 'Remitente bloqueado',
    unsubSent: 'Solicitud de desuscripción enviada',
    needsApiKey: 'Configura tu API key en Ajustes para clasificar con IA',
    cached: '(datos en caché)'
  },
  filters: {
    title: 'Filtros de Gmail',
    create: 'Crear filtro',
    noFilters: 'No hay filtros configurados',
    existing: 'Filtros existentes',
    deleteConfirm: '¿Eliminar este filtro?',
    deleted: 'Filtro eliminado',
    created: 'Filtro creado exitosamente',
    labels: 'Etiquetas',
    createLabel: 'Crear etiqueta',
    labelName: 'Nombre de la etiqueta',
    labelCreated: 'Etiqueta creada',
    form: {
      from: 'De (remitente)',
      to: 'Para (destinatario)',
      subject: 'Asunto contiene',
      hasWords: 'Contiene palabras',
      doesntHave: 'No contiene',
      action: 'Acción',
      addLabel: 'Agregar etiqueta',
      markRead: 'Marcar como leído',
      archive: 'Archivar',
      trash: 'Enviar a papelera',
      selectLabel: 'Seleccionar etiqueta',
      save: 'Guardar filtro',
      cancel: 'Cancelar'
    }
  },
  settings: {
    title: 'Ajustes',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'AIzaSy...',
    apiKeyHelp: 'Tu key se almacena encriptada solo en tu navegador',
    provider: 'Proveedor de IA',
    providerHelp: 'Selecciona el servicio de IA para clasificar emails',
    save: 'Guardar',
    saved: 'Guardado',
    clearCache: 'Limpiar caché',
    cacheCleared: 'Caché limpiado',
    language: 'Idioma',
    cacheInfo: 'Los datos de emails y clasificaciones se guardan localmente para no reprocesar cada vez.'
  },
  common: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    yes: 'Sí',
    no: 'No',
    save: 'Guardar',
    delete: 'Eliminar'
  }
}
