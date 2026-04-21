"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n/language-context";

interface UserContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    uploadPhoto: (file: File) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();
    const { toast } = useToast();
    const t = useT();

    const fetchUser = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                throw error;
            }
            setSession(session);
            setUser(session?.user ?? null);
        } catch {
            // silently ignore session fetch errors
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);

            if (event === 'SIGNED_OUT') {
                router.push('/login'); // Optional: redirect on logout
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    const uploadPhoto = async (file: File) => {
        if (!user) {
            return;
        }

        try {
            setIsLoading(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload — try 'profile-photos' first, fall back to 'avatars'
            // bucketName is set at the point where the upload actually succeeds so that
            // the public URL below always references the correct bucket.
            let bucketName = 'profile-photos';
            const { error: primaryError } = await supabase.storage
                .from('profile-photos')
                .upload(filePath, file);

            if (primaryError?.message?.includes('Bucket not found')) {
                const { error: fallbackError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file);

                if (fallbackError) {
                    throw fallbackError;
                }
                // Record which bucket was actually used before building the public URL
                bucketName = 'avatars';
            } else if (primaryError) {
                throw primaryError;
            }

            // 2. Get Public URL — bucketName is guaranteed to match the bucket used above

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            // Temporary debug — remove once broken-image is resolved
            console.log("[uploadPhoto] bucket:", bucketName, "| filePath:", filePath, "| publicUrl:", publicUrl);

            // 3. Update User Metadata
            const { data: updateData, error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) {
                throw updateError;
            }

            // 4. Update local state — use the user returned by updateUser() directly.
            // getSession() returns a cached session that won't yet reflect the new
            // avatar_url, so we must not call fetchUser() here.
            if (updateData.user) {
                setUser(updateData.user);
            }

            toast({
                title: t("photo.updated"),
                description: t("photo.updatedBody"),
                variant: 'default'
            });

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : t("common.tryAgainLater");
            toast({
                title: t("photo.uploadFail"),
                description: message,
                variant: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <UserContext.Provider value={{ user, session, isLoading, uploadPhoto }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
