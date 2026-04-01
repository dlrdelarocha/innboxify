export default {
  nav: {
    dashboard: 'Dashboard',
    filters: 'Filters',
    settings: 'Settings',
    logout: 'Sign out'
  },
  login: {
    title: 'Innboxify',
    subtitle: 'Manage, classify and clean your inbox with artificial intelligence',
    signIn: 'Sign in with Google',
    features: {
      classify: 'Classify senders with AI',
      filters: 'Create Gmail filters',
      unsubscribe: 'Unsubscribe easily',
      clean: 'Bulk clean your inbox'
    }
  },
  dashboard: {
    title: 'Senders',
    loading: 'Loading emails...',
    fetchingIds: 'Fetching email list: {count} found...',
    fetchingMetadata: 'Downloading metadata: {current} of {total}',
    classifying: 'Classifying with AI: {current} of {total}',
    noEmails: 'No emails found',
    refresh: 'Refresh',
    classify: 'Classify with AI',
    search: 'Search sender or domain...',
    filterCategory: 'All categories',
    allCategories: 'All',
    manageSenders: 'Manage {count} unique senders',
    showingSenders: 'Showing {count} senders',
    stats: {
      totalSenders: 'Total Senders',
      totalEmails: 'Total Emails',
      classified: 'Classified',
      topDomain: 'Top Domain'
    },
    sync: {
      fetchingIds: 'Finding emails... {count} found',
      fetchingMetadata: 'Syncing: {detail} ({percent}%)',
      complete: 'Sync complete'
    },
    table: {
      sender: 'Sender',
      domain: 'Domain',
      category: 'Category',
      count: 'Emails',
      unsubscribe: 'Unsubscribe',
      actions: 'Actions'
    },
    actions: {
      deleteAll: 'Delete all',
      block: 'Block',
      createFilter: 'Create filter',
      unsubAuto: 'Unsubscribe (auto)',
      unsubManual: 'Unsubscribe (manual)',
      noUnsub: 'Not available'
    },
    confirmDelete: 'Delete {count} emails from {sender}?',
    confirmBlock: 'Block {sender}? Future emails will go to trash.',
    deleted: '{count} emails deleted',
    blocked: 'Sender blocked',
    unsubSent: 'Unsubscribe request sent',
    needsApiKey: 'Configure your API key in Settings to classify with AI',
    cached: '(cached data)'
  },
  filters: {
    title: 'Gmail Filters',
    create: 'Create filter',
    noFilters: 'No filters configured',
    existing: 'Existing filters',
    deleteConfirm: 'Delete this filter?',
    deleted: 'Filter deleted',
    created: 'Filter created successfully',
    labels: 'Labels',
    createLabel: 'Create label',
    labelName: 'Label name',
    labelCreated: 'Label created',
    form: {
      from: 'From (sender)',
      to: 'To (recipient)',
      subject: 'Subject contains',
      hasWords: 'Has words',
      doesntHave: 'Doesn\'t have',
      action: 'Action',
      addLabel: 'Add label',
      markRead: 'Mark as read',
      archive: 'Archive',
      trash: 'Move to trash',
      selectLabel: 'Select label',
      save: 'Save filter',
      cancel: 'Cancel'
    }
  },
  settings: {
    title: 'Settings',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'AIzaSy...',
    apiKeyHelp: 'Your key is encrypted and stored only in your browser',
    provider: 'AI Provider',
    providerHelp: 'Select the AI service for email classification',
    save: 'Save',
    saved: 'Saved',
    clearCache: 'Clear cache',
    cacheCleared: 'Cache cleared',
    language: 'Language',
    cacheInfo: 'Email data and classifications are stored locally to avoid reprocessing.'
  },
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    cancel: 'Cancel',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    save: 'Save',
    delete: 'Delete'
  }
}
