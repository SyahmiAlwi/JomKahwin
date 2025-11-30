import AuthForm from "@/components/features/auth-form";

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-batik-pattern opacity-5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10 w-full flex justify-center">
                <AuthForm />
            </div>
        </main>
    );
}
