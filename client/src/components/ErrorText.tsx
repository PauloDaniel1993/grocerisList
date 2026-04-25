type ErrorTextProps = { message: string | null; id: string };

export function ErrorText({ message, id }: ErrorTextProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="error">
      {message}
    </p>
  );
}
