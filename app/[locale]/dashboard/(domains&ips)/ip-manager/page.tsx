function  page() {
  return (
    <div>
      page
    </div>
  );
}
export default page;

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
