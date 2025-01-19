interface HeaderProps {
  label: string;
}

export default function Header({ label }: HeaderProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-2">
      <h1 className="text-3xl font-bold">Next Auth</h1>
      <p className="font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
