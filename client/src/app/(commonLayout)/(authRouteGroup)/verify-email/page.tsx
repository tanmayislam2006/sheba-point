import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type VerifyEmailPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const VerifyEmailPage = async ({ searchParams }: VerifyEmailPageProps) => {
  const resolvedSearchParams = (await searchParams) ?? {};
  const email = resolvedSearchParams.email;
  const registered = resolvedSearchParams.registered;

  const safeEmail = typeof email === "string" ? email : null;
  const isJustRegistered = registered === "true";

  return (
    <Card className="mx-auto w-full max-w-md border-border/70 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Verify Your Email
        </CardTitle>
        <CardDescription>
          Complete your account activation before logging in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isJustRegistered && (
          <Alert>
            <AlertTitle>Registration successful</AlertTitle>
            <AlertDescription>
              Please verify your email{safeEmail ? `: ${safeEmail}` : ""}.
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertTitle>Verification logic pending</AlertTitle>
          <AlertDescription>
            Email verification action and resend flow will be added soon.
          </AlertDescription>
        </Alert>

        <p className="text-sm text-muted-foreground">
          After verifying your email, continue to{" "}
          <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
            login
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
};

export default VerifyEmailPage;
