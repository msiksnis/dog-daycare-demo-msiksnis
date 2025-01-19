import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.BASE_URL}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: "Do not replay <mail@mail.devmarty.com>",
    to: email,
    subject: "Verify your email address",
    html: `
      <p>Click the link below to verify your email address:</p>
      <a href="${confirmLink}">${confirmLink}</a>
    `,
  });
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.BASE_URL}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: "Do not replay <mail@mail.devmarty.com>",
    to: email,
    subject: "Reset your password",
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });
};

export const sendTwoFactorEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: "Do not replay <mail@mail.devmarty.com>",
    to: email,
    subject: "Your two-factor authentication code",
    html: `
      <p>Your two-factor authentication code is:</p>
      <h1>${token}</h1>
    `,
  });
};

export const sendRoleAcceptedEmail = async (email: string, role: string) => {
  await resend.emails.send({
    from: "Do not replay <mail@mail.devmarty.com>",
    to: email,
    subject: "Role request approved",
    html: `
      <p>Your request for the ${role} role has been approved.</p>
    `,
  });
};

export const sendRoleRejectedEmail = async (email: string, role: string) => {
  await resend.emails.send({
    from: "Do not replay <mail@mail.devmarty.com>",
    to: email,
    subject: "Role request rejected",
    html: `
      <p>Your request for the ${role} role has been rejected. You can contact admin for more information.</p>
    `,
  });
};
