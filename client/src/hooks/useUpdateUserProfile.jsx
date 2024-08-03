import { toast } from "react-hot-toast";

import { useMutation, useQueryClient } from "react-query";

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateProfile, isLoading: isUpdatingProfile } = useMutation({
    mutationFn: async (formData) => {
      try {
        const res = await fetch(`/api/users/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update profile");

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },

    onSuccess: () => {
      toast.success("Profile updated successfully");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["user-profile"] }),
      ]);
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;
