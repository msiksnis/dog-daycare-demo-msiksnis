import { currentUserServer } from "@/lib/serverAuth";
import UpdateProfileForm from "./UpdateProfileForm";
import Container from "@/components/Container";

export default async function ProfilePagePage() {
  const user = await currentUserServer();

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <Container heading="Update Profile">
      <UpdateProfileForm user={user} />
    </Container>
  );
}
