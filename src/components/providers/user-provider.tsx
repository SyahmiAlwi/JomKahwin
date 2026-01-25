"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

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

    const fetchUser = async () => {
        try {
            console.log("UserProvider: Fetching session...");
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("UserProvider: Error getting session:", error);
                throw error;
            }
            console.log("UserProvider: Session retrieved:", session ? "Found" : "Null", session?.user?.id);
            setSession(session);
            setUser(session?.user ?? null);
        } catch (error) {
            console.error('Error fetching user:', error);
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
            console.error("No user found in uploadPhoto");
            return;
        }

        console.log("Starting uploadPhoto for user:", user.id);
        console.log("File details:", file.name, file.size, file.type);

        try {
            setIsLoading(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;
            console.log("Generated filePath:", filePath);

            // 1. Upload to 'profile-photos' bucket (fallback to 'avatars' if needed)
            console.log("Attempting upload to 'profile-photos'...");
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(filePath, file);

            if (uploadError) {
                console.warn("Upload to 'profile-photos' failed:", uploadError);
            } else {
                console.log("Upload to 'profile-photos' success:", uploadData);
            }

            // Fallback to 'avatars' if 'profile-photos' doesn't exist
            if (uploadError && uploadError.message.includes('Bucket not found')) {
                console.log("Bucket 'profile-photos' not found. Retrying with 'avatars'...");
                const { error: retryError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file);

                if (retryError) {
                    console.error("Fallback upload to 'avatars' failed:", retryError);
                    throw retryError;
                }
                console.log("Fallback upload to 'avatars' success");
            } else if (uploadError) {
                throw uploadError;
            }

            // 2. Get Public URL
            let bucketName = 'profile-photos';
            if (uploadError && uploadError.message.includes('Bucket not found')) {
                bucketName = 'avatars';
            }
            console.log("Getting Public URL from bucket:", bucketName);

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            console.log("Generated Public URL:", publicUrl);

            // 3. Update User Metadata
            console.log("Updating user metadata with avatar_url...");
            const { data: updateData, error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) {
                console.error("Update user metadata failed:", updateError);
                throw updateError;
            }
            console.log("User metadata updated successfully:", updateData);

            // 4. Update local state
            console.log("Refetching user session...");
            await fetchUser(); // Refresh user to get new metadata
            console.log("User session refreshed.");

            toast({
                title: "Foto dikemaskini!",
                description: "Foto profil anda telah berjaya dimuat naik.",
                variant: 'default' // Or success if available
            });

        } catch (error: any) {
            console.error('Error uploading photo:', error);
            toast({
                title: "Gagal memuat naik",
                description: error.message || "Sila cuba lagi nanti.",
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
