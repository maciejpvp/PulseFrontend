import { AlertTriangle } from "lucide-react";

interface ErrorPageProps {
    title?: string;
    message?: string;
}

export const ErrorPage = ({
    title = "Something went wrong",
    message = "",
}: ErrorPageProps) => {
    return (
        <div className="w-full flex min-h-[80vh] flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-500">
            <AlertTriangle className="h-12 w-12 mb-4 text-foreground" />

            <h1 className="mb-2 text-2xl font-medium tracking-tight text-foreground">
                {title}
            </h1>

            {message && (
                <p className="max-w-[500px] text-muted-foreground text-lg">
                    {message}
                </p>
            )}
        </div>
    );
};