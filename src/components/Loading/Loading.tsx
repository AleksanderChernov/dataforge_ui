import { Loader } from "lucide-react";

export default function Loading({
  message,
  loader = true,
}: {
  message: string;
  loader: boolean;
}) {
  return (
    <div
      className={`flex flex-col justify-center align-items-center text-center flex-col`}
    >
      <div className="flex items-center justify-center">
        {loader && (
          <Loader className="animate-spin text-muted-foreground" size={34} />
        )}
      </div>
      <h1 className={"text-xl"}>{message}</h1>
    </div>
  );
}
