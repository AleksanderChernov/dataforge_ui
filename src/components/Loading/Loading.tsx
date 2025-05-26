import { Loader } from "lucide-react";

export default function Loading({ message }: { message: string }) {
  return (
    <div
      className={`flex flex-col justify-center align-items-center text-center flex-col`}
    >
      <div className="flex items-center justify-center">
        <Loader className="animate-spin text-muted-foreground" size={34} />
      </div>
      <h1>{message}</h1>
    </div>
  );
}
