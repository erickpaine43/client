"use server";


export async function getClientsPage(
  campaignId: string,
  page: number,
  limit: number = 10
) {
    // mock data
    const clients = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        status: "Active",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        status: "Inactive",
      },
      {
        id: 3,
        name: "Bob Johnson",
        email: "bob@example.com",
        status: "Active",
      },
    ];
    console.log({ campaignId, page})

    const total = clients.length;
    const pages = Math.ceil(total / limit);

    return {
      clients,
      total,
      pages,
    };
}
