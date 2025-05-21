export default function Loading({ message }: { message: string }) {
  return (
    <div
      className={`flex justify-center align-items-center text-center flex-col`}
    >
      <h1>{message}</h1>
    </div>
  );
}
