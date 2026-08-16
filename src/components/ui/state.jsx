export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">{label}</div>
  );
}

export function ErrorState({ message = "Failed to load data from the API." }) {
  return <div className="flex items-center justify-center py-10 text-sm text-destructive">{message}</div>;
}
