import { OnboardingLayout } from "@/components/onboarding";
import { OnboardingProvider } from "@/context/onboarding-context";

function OnboardingPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Welcome to PenguinMails! 🐧
        </h1>
        <p className="text-lg text-muted-foreground">
          Let&apos;s get you set up for cold email success
        </p>
      </div>
      <OnboardingProvider>
        <OnboardingLayout />
      </OnboardingProvider>
    </div>
  );
}

export default OnboardingPage;
