type EmptyGroceriesProps = {
  message?: string;
};

const defaultMessage = "Your list is empty.";

export function EmptyGroceries({ message = defaultMessage }: EmptyGroceriesProps) {
  return (
    <p className="empty-groceries" role="status">
      {message}
    </p>
  );
}
