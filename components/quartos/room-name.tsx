export function RoomName({ name }: { name: string }) {
  const [label, ...rest] = name.split(" ");
  const number = rest.join(" ");

  if (!number) return <>{name}</>;

  return (
    <>
      {label} <span className="font-sans">{number}</span>
    </>
  );
}
