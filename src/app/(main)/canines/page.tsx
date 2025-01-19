import prismadb from "@/lib/prismadb";
import { CheckInStatus } from "@prisma/client";
import Canines from "./components/Canines";
import Container from "@/components/Container";

type CanineWithSelectedFields = {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
    mobile: string | null;
    email: string | null;
  };
  upcomingBookings: Array<{
    date: Date;
    isHalfDay: boolean;
  }>;
  previousBookings: Array<{
    date: Date;
    isHalfDay: boolean;
    checkInStatus: CheckInStatus;
  }>;
};

export default async function CaninePage() {
  const canines = await prismadb.canine.findMany({
    select: {
      id: true,
      name: true,
      owner: {
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
        },
      },
      bookings: {
        select: {
          date: true,
          isHalfDay: true,
          checkInStatus: true,
        },
      },
    },
  });

  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));

  const data: CanineWithSelectedFields[] = canines.map((canine) => {
    const upcomingBookings = canine.bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate > today ||
        (bookingDate.toDateString() === today.toDateString() &&
          booking.checkInStatus === "NOT_CHECKED_IN")
      );
    });

    const previousBookings = canine.bookings.filter(
      (booking) => new Date(booking.date) < today,
    );

    return {
      id: canine.id,
      name: canine.name,
      owner: canine.owner,
      upcomingBookings,
      previousBookings,
    };
  });

  return (
    <Container heading={`Canines (${data.length})`} subHeading="Manage canines">
      <Canines data={data} />
    </Container>
  );
}
