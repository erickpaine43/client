import { useRouter } from "next/navigation";

function useBack() {
  const router = useRouter();

  function handleBack() {
    router.back();
  }

  return handleBack;
}
export default useBack;
