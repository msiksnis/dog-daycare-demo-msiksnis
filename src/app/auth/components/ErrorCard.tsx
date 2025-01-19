import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import Header from "./Header";
import BackButton from "./BackButton";

export default function ErrorCard() {
  return (
    <Card className="w-96 shadow-md">
      <CardHeader>
        <Header label="Oops! Something went wrong!" />
      </CardHeader>
      <CardFooter>
        <BackButton label="Back to login" href="/auth/login" />
      </CardFooter>
    </Card>
  );
}
