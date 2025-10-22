"use client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // const { user, loading } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!loading && !user) { 
  //     router.push("/");
  //   }
  // }, [loading, user, router]);

  // if (loading || !user) {
  //   return <div className="p-4">Loading...</div>;
  // }

  return <>{children}</>;
};
