import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Crown, Loader2 } from "lucide-react";
import { Plan } from "@/types/settings/plans";

const defaultPlans: Plan[] = [
  {
    id: 'starter',
    name: "Starter",
    slug: "starter",
    description: "Perfect for small businesses getting started with email marketing",
    maxUsers: 1,
    maxDomains: 1,
    maxCampaignsPerMonth: 100,
    apiRateLimit: 1000,
    priceMonthly: 3500, // $35 in cents
    priceYearly: 35000, // $350 in cents
    features: ["Basic campaigns", "Email support", "Basic templates", "Basic analytics"],
    isActive: true,
  },
  {
    id: 'growth',
    name: "Growth",
    slug: "growth",
    description: "Ideal for growing businesses needing more power and features",
    maxUsers: 5,
    maxDomains: 3,
    maxCampaignsPerMonth: 1000,
    apiRateLimit: 5000,
    priceMonthly: 5500, // $55 in cents
    priceYearly: 55000, // $550 in cents
    features: ["Advanced campaigns", "Priority support", "Custom templates", "Detailed analytics", "Advanced segmentation"],
    isActive: true,
  },
  {
    id: 'scale',
    name: "Scale",
    slug: "scale",
    description: "For scaling businesses with advanced marketing needs",
    maxUsers: 20,
    maxDomains: 10,
    maxCampaignsPerMonth: 5000,
    apiRateLimit: 25000,
    priceMonthly: 8900, // $89 in cents
    priceYearly: 89000, // $890 in cents
    features: ["Advanced campaigns", "Priority support", "Custom templates", "Detailed analytics", "Advanced segmentation", "API access", "Custom domain"],
    isActive: true,
  },
  {
    id: 'pro',
    name: "Pro",
    slug: "pro",
    description: "Enterprise-grade solution for large organizations",
    maxUsers: -1, // unlimited
    maxDomains: -1, // unlimited
    maxCampaignsPerMonth: -1, // unlimited
    apiRateLimit: 100000,
    priceMonthly: 18900, // $189 in cents
    priceYearly: 189000, // $1890 in cents
    features: ["Advanced campaigns", "Dedicated support", "Custom templates", "Detailed analytics", "Advanced segmentation", "API access", "Custom domain", "SSO integration", "White label"],
    isActive: true,
  },
];

function ChangePlanTrigger({ title, plans = defaultPlans, onSelectPlan, isLoading }: { title: string; plans?: Plan[]; onSelectPlan: (plan: Plan) => Promise<void>; isLoading?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={isLoading}>{title}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl  max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3">
          <DialogTitle className="text-2xl font-bold">
            Choose Your Plan
          </DialogTitle>
          <p className="text-muted-foreground">
            Select the perfect plan for your email marketing needs
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/50"
            >
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-primary">
                    ${(plan.priceMonthly / 100).toFixed(0)}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-sm">
                  {plan.maxUsers === -1 ? 'Unlimited Users' : `${plan.maxUsers} Users`}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Domains
                    </span>
                    <span className="font-semibold text-foreground">
                      {plan.maxDomains === -1 ? 'Unlimited' : plan.maxDomains}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Campaigns/Month
                    </span>
                    <span className="font-semibold text-foreground">
                      {plan.maxCampaignsPerMonth === -1 ? 'Unlimited' : plan.maxCampaignsPerMonth.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Users
                    </span>
                    <span className="font-semibold text-foreground">
                      {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers}
                    </span>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full" disabled={isLoading}>
                      Change Plan
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex-center">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
                          <Crown className="text-green-500" />
                        </div>
                      </div>
                      <AlertDialogTitle className="text-center">
                        Confirm Plan Upgrade
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-center">
                        You&apos;re about to switch to {plan.name}. You will be charged the
                        prorated difference immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel asChild>
                        <Button variant="outline" disabled={isLoading}>Cancel</Button>
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button disabled={isLoading} onClick={async () => { await onSelectPlan(plan); }}>
                          {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin inline" />Processing...</> : 'Confirm Upgrade'}
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
function ConfirmDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Change Plan
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
              <Crown className="text-green-500" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">
            Confirm Plan Upgrade
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You&apos;re about to switch from Growth to Pro. You will be charged
            the prorated difference immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button>Confirm Upgrade</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ChangePlanTrigger };
