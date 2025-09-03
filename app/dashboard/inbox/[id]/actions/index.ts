const mockEmails = [
  {
    id: 1,
    subject: "Test Email",
    preview: "This is a test preview",
    message: "This is a test message",
    body: "This is a test body",
    createdAt: new Date(),
    date: new Date().toISOString(),
    campaign: { id: 1, name: "Test Campaign" },
  },
];

export async function fetchEmailById(id: string) {
  const email = mockEmails.find((email) => email.id === parseInt(id));
  if (!email) {
    return null;
  }
  return {
    ...email,
    htmlContent: email.message,
  };
}
