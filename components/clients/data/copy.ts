export const copyText = {
  headers: {
    title: "Client Management",
    clientsCampaign: (campaignName: string) => `Clients for ${campaignName}`,
  },
  buttons: {
    addClient: "Add Client",
    previous: "Previous",
    next: "Next",
    hidePII: "Hide PII",
    showPII: "Show PII",
    copyClipboard: "Copy",
    removeClient: "Remove Client",
    cancel: "Cancel",
  },
  table: {
    pagination: "Page {0} of {1}",
    email: "Email",
    firstName: "First Name",
    lastName: "Last Name",
    notes: "Notes",
    noClientsFound: "No clients found",
  },
  menu: {
    open: "Open menu",
  },
  actions: {
    label: "Actions",
    dataCopied: "Data copied to clipboard",
    copyData: "Copy Data",
    edit: "Edit",
    remove: "Remove",
  },
  filters: {
    emailsPlaceholder: "Search clients...",
  },
  modal: {
    removeClient: {
      title: "Remove Client",
      description: "Are you sure you want to remove this client? This action cannot be undone.",
    },
    notes: {
      title: "Notes",
      edit: "Edit Notes",
    },
  },
  page: {
    title: "Add New Client",
    description: "Create a new client for this campaign",
  },
  form: {
    cancel: "Cancel",
    confirm: "Confirm",
    email: {
      label: "Email",
      placeholder: "client@example.com",
    },
    firstName: {
      label: "First Name",
      placeholder: "John",
    },
    lastName: {
      label: "Last Name",
      placeholder: "Doe",
    },
    notes: {
      label: "Notes",
      placeholder: "Additional information...",
    },
    mask: {
      button: "Mask PII",
      title: "Mask Personal Information",
      description: "This will hide personal identifiable information from view.",
    },
    remove: {
      button: "Remove Client",
      title: "Remove Client",
      description: "Remove this client from the campaign. This action is irreversible.",
    },
    delete: {
      button: "Delete Client",
      title: "Delete Client",
      description: "Permanently delete this client and all associated data. This action is irreversible.",
    },
    buttons: {
      submit: "Add Client",
      submitting: "Adding...",
      update: "Update Client",
      updating: "Updating...",
      cancel: "Cancel",
    },
  },
} as const;
