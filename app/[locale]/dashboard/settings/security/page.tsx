import ChangePasswordForm from "@/components/settings/security/change-password-form";
import SecurityRecommendations from "@/components/settings/security/security-recommendations";
import {
  AlertSuccessTwoAuth,
  TwoAuthProvider,
  TwoFactorAuthenticationSwitch,
} from "@/components/settings/security/two-factor-auth-switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Force dynamic rendering to prevent SSR issues
export const dynamic = "force-dynamic";

function page() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold ">Security Settings</h2>
        <p className="text-gray-600 dark:text-muted-foreground">
          Manage your account security and authentication
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
      <TwoAuthProvider>
        <Card className="grid grid-cols-2 grid-rows-[auto_auto] justify-items-stretch ">
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="justify-self-end">
            <TwoFactorAuthenticationSwitch />
          </CardContent>
          <CardFooter className="col-span-2">
            <AlertSuccessTwoAuth />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <SecurityRecommendations />
          </CardContent>
        </Card>
      </TwoAuthProvider>
    </div>
  );
}

export default page;
