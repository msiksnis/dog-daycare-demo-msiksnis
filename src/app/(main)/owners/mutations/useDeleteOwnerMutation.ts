import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";
import { OwnerWithRelationsProps } from "../components/Owners";

/**
 * Custom hook to delete an owner.
 * Utilizes react-query for managing server state and caching.
 *
 * @returns {object} Mutation object with methods to trigger the deletion.
 */
export const useDeleteOwner = () => {
  const queryClient = useQueryClient();
  const ownersQueryKey = ["owners"];

  return useMutation({
    /**
     * Function to delete an owner by ID.
     *
     * @param {string} ownerId - The ID of the owner to delete.
     * @returns {Promise<void>} A promise that resolves when the deletion is complete.
     */
    mutationFn: async (ownerId: string) => {
      await axios.delete(`/api/owners/${ownerId}`);
    },
    /**
     * Optimistically update the cache before the deletion is confirmed.
     *
     * @param {string} ownerId - The ID of the owner to delete.
     * @returns {object} The previous owners data for rollback.
     */
    onMutate: async (ownerId: string) => {
      await queryClient.cancelQueries({ queryKey: ownersQueryKey });

      const previousOwners =
        queryClient.getQueryData<OwnerWithRelationsProps[]>(ownersQueryKey);

      queryClient.setQueryData<OwnerWithRelationsProps[]>(
        ownersQueryKey,
        (oldOwners) => oldOwners?.filter((owner) => owner.id !== ownerId) || [],
      );

      return { previousOwners };
    },
    /**
     * Handle errors during deletion by rolling back the cache.
     *
     * @param {Error} error - The error that occurred.
     * @param {string} ownerId - The ID of the owner that was attempted to be deleted.
     * @param {object} context - Context returned from onMutate.
     */
    onError: (error, ownerId, context) => {
      queryClient.setQueryData(ownersQueryKey, context?.previousOwners);
      toast.error("Failed to delete owner. Please try again.");
      console.error("Error deleting owner:", error);
    },
    /**
     * Handle successful deletion by refetching the owners list.
     */
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownersQueryKey });
      toast.success("Owner deleted successfully.");
    },
  });
};
