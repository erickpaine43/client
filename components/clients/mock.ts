// Mock data for clients
export function getMockClientsPage(page: number = 1, pageSize: number = 10) {
  const mockClients = [
    {
      id: 1,
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      notes: "Lead Developer",
    },
    {
      id: 2,
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith",
      notes: "Product Manager",
    },
    // Add more mock clients as needed
  ];

  const totalPages = Math.ceil(mockClients.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    clients: mockClients.slice(startIndex, endIndex),
    pages: totalPages,
  };
}
